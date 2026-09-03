package httpapi

import (
	"log"
	"net/http"
	"time"
)

func (a *Auth) sessionUser(r *http.Request) (string, bool) {
	cookie, err := r.Cookie(a.Config.SessionCookieName)
	if err != nil || cookie.Value == "" {
		return "", false
	}
	var userID string
	err = a.DB.QueryRow(r.Context(), `
		UPDATE sessions
		SET last_seen_at = NOW()
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
		RETURNING user_id
	`, hash(cookie.Value)).Scan(&userID)
	return userID, err == nil
}

func (a *Auth) Session(w http.ResponseWriter, r *http.Request) {
	userID, ok := a.sessionUser(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Belum login.")
		return
	}

	var name, email, gender, avatar string
	var encryptedPhone []byte
	err := a.DB.QueryRow(r.Context(), `
		SELECT display_name, email, sso_phone_encrypted, gender, avatar_url
		FROM users
		WHERE id = $1
	`, userID).Scan(&name, &email, &encryptedPhone, &gender, &avatar)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "Sesi tidak valid.")
		return
	}
	phone, err := a.Cipher.Decrypt(encryptedPhone)
	if err != nil {
		writeInternalError(w, err, "Data sesi tidak dapat dibaca.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user": map[string]string{
			"id":        userID,
			"name":      name,
			"email":     email,
			"phone":     phone,
			"gender":    gender,
			"avatarUrl": avatar,
		},
	})
}

func (a *Auth) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(a.Config.SessionCookieName)
	if err == nil && cookie.Value != "" {
		if _, revokeErr := a.DB.Exec(r.Context(), `
			UPDATE sessions SET revoked_at = NOW() WHERE token_hash = $1
		`, hash(cookie.Value)); revokeErr != nil {
			log.Printf("revoke session: %v", revokeErr)
		}
	}

	http.SetCookie(w, a.sessionCookie("", time.Unix(1, 0), -1))
	a.redirectWithMessage(w, r, "/", "msg", "logout_success")
}
