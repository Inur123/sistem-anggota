package httpapi

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
)

type webhookPayload struct {
	EventID   string `json:"eventId"`
	EventType string `json:"eventType"`
	Data      struct {
		LaciMemberID string `json:"laciMemberId"`
		Status       string `json:"status"`
		Reason       string `json:"reason"`
		PeriodeID    string `json:"periodeId"`
		PeriodeNama  string `json:"periodeNama"`
	} `json:"data"`
}

func (a *Auth) WebhookMemberStatus(w http.ResponseWriter, r *http.Request) {
	if a.Config.LaciWebhookSecret == "" || strings.HasPrefix(a.Config.LaciWebhookSecret, "isi_") {
		writeError(w, http.StatusServiceUnavailable, "Webhook Laci belum dikonfigurasi.")
		return
	}
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, maxRequestBodySize))
	if err != nil {
		writeError(w, http.StatusBadRequest, "Payload webhook tidak valid.")
		return
	}
	if !validWebhookSignature(body, r.Header.Get("X-Laci-Signature"), a.Config.LaciWebhookSecret) {
		writeError(w, http.StatusUnauthorized, "Signature webhook tidak valid.")
		return
	}

	var payload webhookPayload
	decoder := json.NewDecoder(bytes.NewReader(body))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "Payload webhook tidak valid.")
		return
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "Payload webhook hanya boleh berisi satu objek JSON.")
		return
	}
	payload.EventID = strings.TrimSpace(payload.EventID)
	payload.EventType = strings.TrimSpace(payload.EventType)
	payload.Data.LaciMemberID = strings.TrimSpace(payload.Data.LaciMemberID)
	if payload.EventID == "" || payload.EventType != "member.status_changed" || payload.Data.LaciMemberID == "" {
		writeError(w, http.StatusUnprocessableEntity, "Payload webhook tidak lengkap.")
		return
	}
	status, ok := mapWebhookStatus(payload.Data.Status)
	if !ok {
		writeError(w, http.StatusUnprocessableEntity, "Status webhook tidak didukung.")
		return
	}

	ctx := r.Context()
	tx, err := a.DB.Begin(ctx)
	if err != nil {
		writeInternalError(w, err, "Webhook gagal diproses.")
		return
	}
	defer func() { _ = tx.Rollback(ctx) }()

	tag, err := tx.Exec(ctx, `
		INSERT INTO webhook_events (id, event_id, event_type, received_at)
		VALUES (gen_random_uuid(), $1, $2, NOW())
		ON CONFLICT (event_id) DO NOTHING
	`, payload.EventID, payload.EventType)
	if err != nil {
		writeInternalError(w, err, "Webhook gagal diproses.")
		return
	}
	if tag.RowsAffected() == 0 {
		writeJSON(w, http.StatusOK, map[string]string{"message": "Event sudah diproses."})
		return
	}

	var profileID, userID string
	err = tx.QueryRow(ctx, `
		WITH updated_period AS (
			UPDATE membership_periods
			SET verification_status = $1::"ProfileStatus",
				rejection_reason = NULLIF($3, ''),
				period_name = COALESCE(NULLIF($4, ''), period_name),
				verified_at = NOW(),
				updated_at = NOW()
			WHERE laci_member_id = $2 AND is_current = true
			RETURNING member_profile_id
		), updated_profile AS (
			UPDATE member_profiles
			SET profile_status = $1::"ProfileStatus", updated_at = NOW()
			FROM updated_period
			WHERE member_profiles.id = updated_period.member_profile_id
			RETURNING member_profiles.id, member_profiles.user_id
		)
		SELECT id, user_id FROM updated_profile
	`, status, payload.Data.LaciMemberID, strings.TrimSpace(payload.Data.Reason), strings.TrimSpace(payload.Data.PeriodeNama)).Scan(&profileID, &userID)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Anggota Laci tidak ditemukan.")
		return
	}
	if err != nil {
		writeInternalError(w, err, "Status anggota gagal diperbarui.")
		return
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
		VALUES ($1, 'member.status_changed', 'member_profile', $2, jsonb_build_object('eventId', $3, 'status', $4))
	`, userID, profileID, payload.EventID, status)
	if err != nil {
		writeInternalError(w, err, "Riwayat webhook gagal disimpan.")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeInternalError(w, err, "Webhook gagal disimpan.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Status anggota diperbarui."})
}

func validWebhookSignature(body []byte, signature, secret string) bool {
	signature = strings.TrimSpace(strings.TrimPrefix(signature, "sha256="))
	provided, err := hex.DecodeString(signature)
	if err != nil {
		return false
	}
	hash := hmac.New(sha256.New, []byte(secret))
	_, _ = hash.Write(body)
	return hmac.Equal(provided, hash.Sum(nil))
}

func mapWebhookStatus(value string) (string, bool) {
	switch strings.ToUpper(strings.TrimSpace(value)) {
	case "DRAFT":
		return "DRAFT", true
	case "PENDING":
		return "PENDING", true
	case "DITERIMA", "APPROVED", "VERIFIED":
		return "DITERIMA", true
	case "DITOLAK", "REJECTED":
		return "DITOLAK", true
	default:
		return "", false
	}
}
