package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type Education struct {
	Level       string `json:"level"`
	Institution string `json:"institution"`
}

type Training struct {
	Name  string `json:"name"`
	Date  string `json:"date"`
	Place string `json:"place"`
}

type ProfileFormData struct {
	FullName   string      `json:"fullName"`
	Gender     string      `json:"gender"`
	Email      string      `json:"email"`
	NIK        string      `json:"nik"`
	NIA        string      `json:"nia"`
	Phone      string      `json:"phone"`
	BirthPlace string      `json:"birthPlace"`
	BirthDate  string      `json:"birthDate"`
	Address    string      `json:"address"`
	Educations []Education `json:"educations"`
	Trainings  []Training  `json:"trainings"`
	Occupation string      `json:"occupation"`
	Hobby      string      `json:"hobby"`
	Position   string      `json:"position"`
}

type SaveProfileRequest struct {
	Version      int             `json:"version"`
	Tingkatan    string          `json:"tingkatan"`
	Pimpinan     string          `json:"pimpinan"`
	PimpinanName string          `json:"pimpinanName"`
	Ranting      string          `json:"ranting"`
	RantingName  string          `json:"rantingName"`
	RantingType  string          `json:"rantingType"`
	FormData     ProfileFormData `json:"formData"`
}

type organizationView struct {
	Role        string `json:"role"`
	TargetID    string `json:"targetId"`
	TargetName  string `json:"targetName"`
	WilayahID   string `json:"wilayahId"`
	WilayahName string `json:"wilayahName"`
	WilayahType string `json:"wilayahType"`
}

func (a *Auth) Profile(w http.ResponseWriter, r *http.Request) {
	userID, ok := a.sessionUser(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Belum login.")
		return
	}

	var id, fullName, status string
	var gender *string
	var version int
	var phone, nik, nia, birthPlace, birthDate, address, rfid, hobby, occupation, educationHistory, trainingHistory, position []byte
	err := a.DB.QueryRow(r.Context(), `
		SELECT id, full_name, gender, phone_encrypted, nik_encrypted, nia_encrypted,
			birth_place_encrypted, birth_date_encrypted, address_encrypted, rfid_encrypted,
			hobby_encrypted, occupation_encrypted, education_history_encrypted,
			training_history_encrypted, position_encrypted, profile_status, profile_version
		FROM member_profiles
		WHERE user_id = $1
	`, userID).Scan(
		&id, &fullName, &gender, &phone, &nik, &nia, &birthPlace, &birthDate, &address,
		&rfid, &hobby, &occupation, &educationHistory, &trainingHistory, &position, &status, &version,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Profil tidak tersedia.")
		return
	}
	if err != nil {
		writeInternalError(w, err, "Profil tidak dapat dimuat.")
		return
	}

	decrypted := make([]string, 0, 9)
	for _, encrypted := range [][]byte{phone, birthPlace, birthDate, address, hobby, occupation, educationHistory, trainingHistory, position} {
		value, decryptErr := a.Cipher.Decrypt(encrypted)
		if decryptErr != nil {
			writeInternalError(w, decryptErr, "Profil tidak dapat dibaca.")
			return
		}
		decrypted = append(decrypted, value)
	}

	var organization *organizationView
	var org organizationView
	var targetName, wilayahID, wilayahName, wilayahType *string
	err = a.DB.QueryRow(r.Context(), `
		SELECT target_role, target_id, target_name, wilayah_id, wilayah_name, wilayah_type
		FROM organization_selections
		WHERE member_profile_id = $1 AND active = true
	`, id).Scan(&org.Role, &org.TargetID, &targetName, &wilayahID, &wilayahName, &wilayahType)
	if err == nil {
		if targetName != nil {
			org.TargetName = *targetName
		}
		if wilayahID != nil {
			org.WilayahID = *wilayahID
		}
		if wilayahName != nil {
			org.WilayahName = *wilayahName
		}
		if wilayahType != nil {
			org.WilayahType = *wilayahType
		}
		organization = &org
	} else if !errors.Is(err, pgx.ErrNoRows) {
		writeInternalError(w, err, "Organisasi profil tidak dapat dimuat.")
		return
	}

	genderValue := ""
	if gender != nil {
		genderValue = *gender
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"id":               id,
		"fullName":         fullName,
		"gender":           genderValue,
		"phone":            decrypted[0],
		"nik":              masked(nik),
		"nia":              masked(nia),
		"hasNik":           len(nik) > 0,
		"hasNia":           len(nia) > 0,
		"hasRfid":          len(rfid) > 0,
		"birthPlace":       decrypted[1],
		"birthDate":        decrypted[2],
		"address":          decrypted[3],
		"rfid":             masked(rfid),
		"hobby":            decrypted[4],
		"occupation":       decrypted[5],
		"educationHistory": decrypted[6],
		"trainingHistory":  decrypted[7],
		"position":         decrypted[8],
		"status":           status,
		"version":          version,
		"organization":     organization,
	})
}

func (a *Auth) SaveProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := a.sessionUser(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Belum login.")
		return
	}

	var request SaveProfileRequest
	if err := decodeJSON(w, r, &request); err != nil {
		writeError(w, http.StatusBadRequest, "Format data tidak valid.")
		return
	}
	normalizeProfileRequest(&request)
	if message := validateProfileRequest(request); message != "" {
		writeError(w, http.StatusUnprocessableEntity, message)
		return
	}

	ctx := r.Context()
	tx, err := a.DB.Begin(ctx)
	if err != nil {
		writeInternalError(w, err, "Profil gagal disimpan.")
		return
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var profileID, status, ssoName, ssoGender string
	var currentVersion int
	var existingNIK, ssoPhone []byte
	err = tx.QueryRow(ctx, `
		SELECT m.id, m.profile_status, m.profile_version, m.nik_encrypted,
			u.display_name, u.gender, u.sso_phone_encrypted
		FROM member_profiles m
		JOIN users u ON u.id = m.user_id
		WHERE m.user_id = $1
		FOR UPDATE OF m
	`, userID).Scan(&profileID, &status, &currentVersion, &existingNIK, &ssoName, &ssoGender, &ssoPhone)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Profil tidak tersedia.")
		return
	}
	if err != nil {
		writeInternalError(w, err, "Profil gagal disimpan.")
		return
	}
	if status == "PENDING" {
		writeError(w, http.StatusConflict, "Profil sedang menunggu verifikasi dan belum dapat diubah.")
		return
	}
	if request.Version != currentVersion {
		writeError(w, http.StatusConflict, "Profil telah berubah. Muat ulang halaman sebelum menyimpan.")
		return
	}
	if request.FormData.NIK == "" && len(existingNIK) == 0 {
		writeError(w, http.StatusUnprocessableEntity, "NIK wajib diisi dengan tepat 16 angka.")
		return
	}
	if ssoName == "" || normalizeGender(ssoGender) == "" || len(ssoPhone) == 0 {
		writeError(w, http.StatusUnprocessableEntity, "Nama, jenis kelamin, dan nomor HP wajib tersedia dari SSO.")
		return
	}

	encrypted, err := a.encryptProfile(request.FormData)
	if err != nil {
		writeInternalError(w, err, "Profil gagal dienkripsi.")
		return
	}
	nextStatus := status
	if status == "DITOLAK" {
		nextStatus = "DRAFT"
	}
	var nextVersion int
	err = tx.QueryRow(ctx, `
		UPDATE member_profiles SET
			full_name = $2,
			gender = $3,
			phone_encrypted = $4,
			nik_encrypted = COALESCE($5, nik_encrypted),
			nia_encrypted = COALESCE($6, nia_encrypted),
			birth_place_encrypted = $7,
			birth_date_encrypted = $8,
			address_encrypted = $9,
			hobby_encrypted = $10,
			occupation_encrypted = $11,
			education_history_encrypted = $12,
			training_history_encrypted = $13,
			position_encrypted = $14,
			profile_status = $15::"ProfileStatus",
			profile_version = profile_version + 1,
			updated_at = NOW()
		WHERE id = $1
		RETURNING profile_version
	`, profileID, ssoName, normalizeGender(ssoGender), ssoPhone, encrypted.nik, encrypted.nia,
		encrypted.birthPlace, encrypted.birthDate, encrypted.address, encrypted.hobby,
		encrypted.occupation, encrypted.educations, encrypted.trainings, encrypted.position, nextStatus,
	).Scan(&nextVersion)
	if err != nil {
		writeInternalError(w, err, "Profil gagal disimpan.")
		return
	}

	targetRole := strings.ToUpper(request.Tingkatan)
	wilayahID, wilayahName, wilayahType := any(nil), any(nil), any(nil)
	if targetRole == "PAC" && request.Ranting != "" {
		wilayahID, wilayahName, wilayahType = request.Ranting, request.RantingName, request.RantingType
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO organization_selections (
			id, member_profile_id, target_role, target_id, target_name,
			wilayah_id, wilayah_name, wilayah_type, active, created_at, updated_at
		) VALUES (gen_random_uuid(), $1, $2::"TargetRole", $3, $4, $5, $6, $7, true, NOW(), NOW())
		ON CONFLICT (member_profile_id) DO UPDATE SET
			target_role = EXCLUDED.target_role,
			target_id = EXCLUDED.target_id,
			target_name = EXCLUDED.target_name,
			wilayah_id = EXCLUDED.wilayah_id,
			wilayah_name = EXCLUDED.wilayah_name,
			wilayah_type = EXCLUDED.wilayah_type,
			active = true,
			updated_at = NOW()
	`, profileID, targetRole, request.Pimpinan, request.PimpinanName, wilayahID, wilayahName, wilayahType)
	if err != nil {
		writeInternalError(w, err, "Organisasi profil gagal disimpan.")
		return
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
		VALUES ($1, 'profile.updated', 'member_profile', $2)
	`, userID, profileID)
	if err != nil {
		writeInternalError(w, err, "Riwayat perubahan gagal disimpan.")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeInternalError(w, err, "Profil gagal disimpan.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message": "Profil berhasil disimpan.",
		"id":      profileID,
		"version": nextVersion,
	})
}

type encryptedProfile struct {
	nik, nia, birthPlace, birthDate, address, hobby, occupation, educations, trainings, position []byte
}

func (a *Auth) encryptProfile(form ProfileFormData) (encryptedProfile, error) {
	encrypt := func(value string) ([]byte, error) {
		if value == "" {
			return nil, nil
		}
		return a.Cipher.Encrypt(value)
	}
	encryptJSON := func(value any) ([]byte, error) {
		encoded, err := json.Marshal(value)
		if err != nil {
			return nil, err
		}
		return a.Cipher.Encrypt(string(encoded))
	}

	result := encryptedProfile{}
	fields := []struct {
		value  string
		target *[]byte
	}{
		{form.NIK, &result.nik}, {form.NIA, &result.nia}, {form.BirthPlace, &result.birthPlace},
		{form.BirthDate, &result.birthDate}, {form.Address, &result.address}, {form.Hobby, &result.hobby},
		{form.Occupation, &result.occupation}, {form.Position, &result.position},
	}
	for _, field := range fields {
		value, err := encrypt(field.value)
		if err != nil {
			return encryptedProfile{}, err
		}
		*field.target = value
	}
	var err error
	result.educations, err = encryptJSON(form.Educations)
	if err != nil {
		return encryptedProfile{}, err
	}
	result.trainings, err = encryptJSON(form.Trainings)
	if err != nil {
		return encryptedProfile{}, err
	}
	return result, nil
}

func normalizeProfileRequest(request *SaveProfileRequest) {
	if request.FormData.Educations == nil {
		request.FormData.Educations = []Education{}
	}
	if request.FormData.Trainings == nil {
		request.FormData.Trainings = []Training{}
	}
	request.Tingkatan = strings.ToLower(strings.TrimSpace(request.Tingkatan))
	request.Pimpinan = strings.TrimSpace(request.Pimpinan)
	request.PimpinanName = strings.TrimSpace(request.PimpinanName)
	request.Ranting = strings.TrimSpace(request.Ranting)
	request.RantingName = strings.TrimSpace(request.RantingName)
	request.RantingType = strings.TrimSpace(request.RantingType)
	request.FormData.NIK = strings.TrimSpace(request.FormData.NIK)
	request.FormData.NIA = strings.TrimSpace(request.FormData.NIA)
	request.FormData.BirthPlace = strings.TrimSpace(request.FormData.BirthPlace)
	request.FormData.BirthDate = strings.TrimSpace(request.FormData.BirthDate)
	request.FormData.Address = strings.TrimSpace(request.FormData.Address)
	request.FormData.Hobby = strings.TrimSpace(request.FormData.Hobby)
	request.FormData.Occupation = strings.TrimSpace(request.FormData.Occupation)
	request.FormData.Position = strings.TrimSpace(request.FormData.Position)
	for index := range request.FormData.Educations {
		request.FormData.Educations[index].Level = strings.TrimSpace(request.FormData.Educations[index].Level)
		request.FormData.Educations[index].Institution = strings.TrimSpace(request.FormData.Educations[index].Institution)
	}
	for index := range request.FormData.Trainings {
		request.FormData.Trainings[index].Name = strings.TrimSpace(request.FormData.Trainings[index].Name)
		request.FormData.Trainings[index].Date = strings.TrimSpace(request.FormData.Trainings[index].Date)
		request.FormData.Trainings[index].Place = strings.TrimSpace(request.FormData.Trainings[index].Place)
	}
}

func validateProfileRequest(request SaveProfileRequest) string {
	if request.Version < 1 {
		return "Versi profil tidak valid. Muat ulang halaman."
	}
	if request.Tingkatan != "cabang" && request.Tingkatan != "pac" {
		return "Tingkatan organisasi wajib dipilih."
	}
	if request.Pimpinan == "" || request.PimpinanName == "" {
		return "Pimpinan organisasi wajib dipilih."
	}
	if request.Tingkatan == "cabang" && request.Ranting != "" {
		return "Cabang tidak boleh memiliki pilihan ranting atau komisariat."
	}
	if request.FormData.NIK != "" && (len(request.FormData.NIK) != 16 || !onlyDigits(request.FormData.NIK)) {
		return "NIK wajib terdiri dari tepat 16 angka."
	}
	if request.FormData.BirthPlace == "" || request.FormData.BirthDate == "" || request.FormData.Address == "" {
		return "Tempat lahir, tanggal lahir, dan alamat wajib diisi."
	}
	birthDate, err := time.Parse("2006-01-02", request.FormData.BirthDate)
	if err != nil || birthDate.After(time.Now()) {
		return "Tanggal lahir tidak valid."
	}
	for _, education := range request.FormData.Educations {
		if education.Level == "" || education.Institution == "" {
			return "Setiap riwayat pendidikan harus memiliki tingkat dan nama instansi."
		}
	}
	for _, training := range request.FormData.Trainings {
		if training.Name == "" || training.Date == "" || training.Place == "" {
			return "Setiap riwayat pengkaderan harus diisi lengkap."
		}
		if _, err := time.Parse("2006-01-02", training.Date); err != nil {
			return "Tanggal riwayat pengkaderan tidak valid."
		}
	}
	return ""
}

func onlyDigits(value string) bool {
	for _, character := range value {
		if character < '0' || character > '9' {
			return false
		}
	}
	return true
}

func masked(value []byte) string {
	if len(value) == 0 {
		return ""
	}
	return "••••"
}
