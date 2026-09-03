package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type laciMemberPayload struct {
	TargetRole             string  `json:"targetRole"`
	TargetID               string  `json:"targetId"`
	WilayahID              *string `json:"wilayahId"`
	NamaLengkap            string  `json:"namaLengkap"`
	JenisKelamin           string  `json:"jenisKelamin"`
	NIK                    string  `json:"nik"`
	NIA                    string  `json:"nia"`
	Email                  string  `json:"email"`
	TempatLahir            string  `json:"tempatLahir"`
	TanggalLahir           string  `json:"tanggalLahir"`
	AlamatLengkap          string  `json:"alamatLengkap"`
	NoHP                   string  `json:"noHp"`
	Hobi                   string  `json:"hobi"`
	Jabatan                string  `json:"jabatan"`
	NoRFID                 string  `json:"noRfid"`
	Pekerjaan              string  `json:"pekerjaan"`
	JenjangPendidikan      string  `json:"jenjangPendidikan"`
	NamaInstansiPendidikan string  `json:"namaInstansiPendidikan"`
}

type laciMemberResponse struct {
	Message string `json:"message"`
	Error   *struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
	Data struct {
		ID          string `json:"id"`
		PeriodeID   string `json:"periodeId"`
		PeriodeNama string `json:"periodeNama"`
	} `json:"data"`
}

func (a *Auth) SubmitProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := a.sessionUser(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Belum login.")
		return
	}
	if a.Config.LaciAPIURL == "" || a.Config.LaciAPIKey == "" || strings.HasPrefix(a.Config.LaciAPIKey, "isi_") {
		writeError(w, http.StatusServiceUnavailable, "Laci belum dikonfigurasi.")
		return
	}

	ctx := r.Context()
	var profile struct {
		ID          string
		Status      string
		Version     int
		FullName    string
		Gender      *string
		Phone       []byte
		NIK         []byte
		NIA         []byte
		BirthPlace  []byte
		BirthDate   []byte
		Address     []byte
		Hobby       []byte
		Position    []byte
		RFID        []byte
		Occupation  []byte
		Education   []byte
		Email       string
		TargetRole  *string
		TargetID    *string
		TargetName  *string
		WilayahID   *string
		WilayahName *string
	}
	err := a.DB.QueryRow(ctx, `
		SELECT m.id, m.profile_status, m.profile_version, m.full_name, m.gender,
			m.phone_encrypted, m.nik_encrypted, m.nia_encrypted, m.birth_place_encrypted,
			m.birth_date_encrypted, m.address_encrypted, m.hobby_encrypted,
			m.position_encrypted, m.rfid_encrypted, m.occupation_encrypted,
			m.education_history_encrypted, u.email, o.target_role, o.target_id,
			o.target_name, o.wilayah_id, o.wilayah_name
		FROM member_profiles m
		JOIN users u ON m.user_id = u.id
		LEFT JOIN organization_selections o ON m.id = o.member_profile_id AND o.active = true
		WHERE m.user_id = $1
	`, userID).Scan(
		&profile.ID, &profile.Status, &profile.Version, &profile.FullName, &profile.Gender,
		&profile.Phone, &profile.NIK, &profile.NIA, &profile.BirthPlace, &profile.BirthDate,
		&profile.Address, &profile.Hobby, &profile.Position, &profile.RFID, &profile.Occupation,
		&profile.Education, &profile.Email, &profile.TargetRole, &profile.TargetID,
		&profile.TargetName, &profile.WilayahID, &profile.WilayahName,
	)
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, "Profil tidak ditemukan atau belum lengkap.")
		return
	}
	if profile.Status == "PENDING" {
		writeError(w, http.StatusConflict, "Pengajuan sedang menunggu verifikasi.")
		return
	}
	if profile.TargetRole == nil || profile.TargetID == nil || *profile.TargetID == "" ||
		profile.FullName == "" || profile.Gender == nil || len(profile.Phone) == 0 || len(profile.NIK) == 0 {
		writeError(w, http.StatusUnprocessableEntity, "Profil dan organisasi tujuan belum lengkap.")
		return
	}

	values := make([]string, 0, 11)
	for _, encrypted := range [][]byte{
		profile.Phone, profile.NIK, profile.NIA, profile.BirthPlace, profile.BirthDate,
		profile.Address, profile.Hobby, profile.Position, profile.RFID, profile.Occupation, profile.Education,
	} {
		value, decryptErr := a.Cipher.Decrypt(encrypted)
		if decryptErr != nil {
			writeInternalError(w, decryptErr, "Profil tidak dapat dibaca.")
			return
		}
		values = append(values, value)
	}

	var educationLevel, educationInstitution string
	if values[10] != "" {
		var educations []Education
		if err := json.Unmarshal([]byte(values[10]), &educations); err != nil {
			writeInternalError(w, err, "Riwayat pendidikan tidak dapat dibaca.")
			return
		}
		if len(educations) > 0 {
			educationLevel = educations[0].Level
			educationInstitution = educations[0].Institution
		}
	}

	gender := ""
	switch normalizeGender(*profile.Gender) {
	case "L":
		gender = "LAKI_LAKI"
	case "P":
		gender = "PEREMPUAN"
	default:
		writeError(w, http.StatusUnprocessableEntity, "Jenis kelamin dari SSO tidak valid.")
		return
	}
	payload := laciMemberPayload{
		TargetRole:             *profile.TargetRole,
		TargetID:               *profile.TargetID,
		WilayahID:              profile.WilayahID,
		NamaLengkap:            profile.FullName,
		JenisKelamin:           gender,
		NIK:                    values[1],
		NIA:                    values[2],
		Email:                  profile.Email,
		TempatLahir:            values[3],
		TanggalLahir:           values[4],
		AlamatLengkap:          values[5],
		NoHP:                   values[0],
		Hobi:                   values[6],
		Jabatan:                values[7],
		NoRFID:                 values[8],
		Pekerjaan:              values[9],
		JenjangPendidikan:      educationLevel,
		NamaInstansiPendidikan: educationInstitution,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		writeInternalError(w, err, "Data pengajuan tidak dapat disiapkan.")
		return
	}

	idempotencyKey := fmt.Sprintf("member-submit:%s:v%d", profile.ID, profile.Version)
	var attemptID string
	err = a.DB.QueryRow(ctx, `
		INSERT INTO sync_attempts
			(id, member_profile_id, idempotency_key, direction, operation, attempt_count, created_at)
		VALUES (gen_random_uuid(), $1, $2, 'TO_LACI'::"SyncDirection", 'member.submit', 1, NOW())
		ON CONFLICT (idempotency_key) DO UPDATE SET
			attempt_count = sync_attempts.attempt_count + 1,
			result_status = 'PROCESSING'
		RETURNING id
	`, profile.ID, idempotencyKey).Scan(&attemptID)
	if err != nil {
		writeInternalError(w, err, "Sinkronisasi gagal dimulai.")
		return
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, a.Config.LaciAPIURL+"/public/anggota", bytes.NewReader(body))
	if err != nil {
		writeInternalError(w, err, "Permintaan ke Laci tidak dapat dibuat.")
		return
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-API-Key", a.Config.LaciAPIKey)
	request.Header.Set("Idempotency-Key", idempotencyKey)
	if correlationID, randomErr := randomValue(); randomErr == nil {
		request.Header.Set("X-Correlation-ID", correlationID)
	}

	response, err := a.HTTPClient.Do(request)
	if err != nil {
		a.updateSyncAttempt(attemptID, 0, "RETRYABLE")
		writeUpstreamError(w, err, "Laci sedang tidak tersedia. Coba kirim ulang beberapa saat lagi.")
		return
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, maxRequestBodySize+1))
	if err != nil || len(responseBody) > maxRequestBodySize {
		a.updateSyncAttempt(attemptID, response.StatusCode, "RETRYABLE")
		writeError(w, http.StatusBadGateway, "Respons Laci tidak valid.")
		return
	}
	var laciResponse laciMemberResponse
	if err := json.Unmarshal(responseBody, &laciResponse); err != nil {
		a.updateSyncAttempt(attemptID, response.StatusCode, "FAILED")
		writeError(w, http.StatusBadGateway, "Respons Laci tidak valid.")
		return
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		result := "FAILED"
		if response.StatusCode >= http.StatusInternalServerError {
			result = "RETRYABLE"
		}
		a.updateSyncAttempt(attemptID, response.StatusCode, result)
		writeError(w, http.StatusUnprocessableEntity, "Pengiriman ke Laci ditolak. Periksa kembali data profil.")
		return
	}
	if laciResponse.Data.ID == "" || laciResponse.Data.PeriodeID == "" {
		a.updateSyncAttempt(attemptID, response.StatusCode, "FAILED")
		writeError(w, http.StatusBadGateway, "Respons Laci tidak memuat identitas anggota atau periode.")
		return
	}

	tx, err := a.DB.Begin(ctx)
	if err != nil {
		writeInternalError(w, err, "Hasil pengajuan gagal disimpan.")
		return
	}
	defer func() { _ = tx.Rollback(ctx) }()
	statements := []struct {
		query string
		args  []any
	}{
		{`UPDATE sync_attempts SET http_status = $1, result_status = 'SUCCESS' WHERE id = $2`, []any{response.StatusCode, attemptID}},
		{`UPDATE member_profiles SET profile_status = 'PENDING'::"ProfileStatus", updated_at = NOW() WHERE id = $1`, []any{profile.ID}},
		{`UPDATE membership_periods SET is_current = false, updated_at = NOW() WHERE member_profile_id = $1 AND is_current = true`, []any{profile.ID}},
	}
	for _, statement := range statements {
		if _, err := tx.Exec(ctx, statement.query, statement.args...); err != nil {
			writeInternalError(w, err, "Hasil pengajuan gagal disimpan.")
			return
		}
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO membership_periods (
			id, member_profile_id, laci_member_id, laci_period_id, period_name,
			organization_name, wilayah_name, is_current, verification_status,
			submitted_at, created_at, updated_at
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5, $6, true,
			'PENDING'::"ProfileStatus", NOW(), NOW(), NOW()
		)
		ON CONFLICT (member_profile_id, laci_period_id) DO UPDATE SET
			laci_member_id = EXCLUDED.laci_member_id,
			period_name = EXCLUDED.period_name,
			organization_name = EXCLUDED.organization_name,
			wilayah_name = EXCLUDED.wilayah_name,
			is_current = true,
			verification_status = 'PENDING'::"ProfileStatus",
			submitted_at = NOW(),
			updated_at = NOW()
	`, profile.ID, laciResponse.Data.ID, laciResponse.Data.PeriodeID, laciResponse.Data.PeriodeNama, profile.TargetName, profile.WilayahName)
	if err != nil {
		writeInternalError(w, err, "Periode keanggotaan gagal disimpan.")
		return
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
		VALUES ($1, 'profile.submitted', 'member_profile', $2)
	`, userID, profile.ID)
	if err != nil {
		writeInternalError(w, err, "Riwayat pengajuan gagal disimpan.")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeInternalError(w, err, "Hasil pengajuan gagal disimpan.")
		return
	}

	message := strings.TrimSpace(laciResponse.Message)
	if message == "" {
		message = "Data dikirim ke Laci dan menunggu verifikasi."
	}
	writeJSON(w, http.StatusAccepted, map[string]string{"message": message})
}

func (a *Auth) updateSyncAttempt(attemptID string, status int, result string) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if _, err := a.DB.Exec(ctx, `
		UPDATE sync_attempts SET http_status = NULLIF($1, 0), result_status = $2 WHERE id = $3
	`, status, result, attemptID); err != nil {
		log.Printf("update sync attempt %s: %v", attemptID, err)
	}
}
