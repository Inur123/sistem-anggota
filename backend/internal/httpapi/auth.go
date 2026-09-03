package httpapi

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/google/uuid"
	"github.com/ipnu-ippnu/sistem-anggota/backend/internal/config"
	"github.com/ipnu-ippnu/sistem-anggota/backend/internal/cryptox"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/oauth2"
)

type Auth struct {
	Config     config.Config
	DB         *pgxpool.Pool
	Cipher     *cryptox.AESGCM
	Provider   *oidc.Provider
	HTTPClient *http.Client
}

type ssoUser struct {
	Sub          string `json:"sub"`
	Email        string `json:"email"`
	Name         string `json:"name"`
	DisplayName  string `json:"display_name"`
	AvatarURL    string `json:"avatar_url"`
	Phone        string `json:"phone"`
	PhoneNumber  string `json:"phone_number"`
	Mobile       string `json:"mobile"`
	Gender       string `json:"gender"`
	JenisKelamin string `json:"jenis_kelamin"`
}

func NewAuth(ctx context.Context, cfg config.Config, db *pgxpool.Pool, cipher *cryptox.AESGCM) (*Auth, error) {
	provider, err := oidc.NewProvider(ctx, cfg.SSOIssuer)
	if err != nil {
		return nil, fmt.Errorf("inisialisasi OIDC provider: %w", err)
	}
	return &Auth{
		Config:     cfg,
		DB:         db,
		Cipher:     cipher,
		Provider:   provider,
		HTTPClient: &http.Client{Timeout: cfg.HTTPClientTimeout},
	}, nil
}

func (a *Auth) Login(w http.ResponseWriter, r *http.Request) {
	state, err := randomValue()
	if err != nil {
		writeInternalError(w, err, "Gagal memulai login.")
		return
	}
	nonce, err := randomValue()
	if err != nil {
		writeInternalError(w, err, "Gagal memulai login.")
		return
	}
	verifier, err := randomValue()
	if err != nil {
		writeInternalError(w, err, "Gagal memulai login.")
		return
	}
	verifierEncrypted, err := a.Cipher.Encrypt(verifier)
	if err != nil {
		writeInternalError(w, err, "Gagal memulai login.")
		return
	}

	_, err = a.DB.Exec(r.Context(), `
		INSERT INTO oauth_transactions
			(id, state_hash, nonce_hash, code_verifier_encrypted, return_to, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, uuid.New(), hash(state), hash(nonce), verifierEncrypted, safeReturnTo(r.URL.Query().Get("return_to")), time.Now().Add(5*time.Minute))
	if err != nil {
		writeInternalError(w, err, "Gagal memulai login.")
		return
	}

	challenge := base64.RawURLEncoding.EncodeToString(hash(verifier))
	oauthConfig := a.oauthConfig()
	target := oauthConfig.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("nonce", nonce),
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	)
	http.Redirect(w, r, target, http.StatusFound)
}

func (a *Auth) Callback(w http.ResponseWriter, r *http.Request) {
	if callbackError := r.URL.Query().Get("error"); callbackError != "" {
		a.redirectWithMessage(w, r, "/", "error", "Login dibatalkan atau tidak disetujui.")
		return
	}
	if r.URL.Query().Get("iss") != a.Config.SSOIssuer {
		writeError(w, http.StatusBadRequest, "Issuer callback tidak valid.")
		return
	}

	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")
	if state == "" || code == "" {
		writeError(w, http.StatusBadRequest, "Kode login tidak tersedia.")
		return
	}

	var nonceHash, verifierEncrypted []byte
	var destination string
	err := a.DB.QueryRow(r.Context(), `
		UPDATE oauth_transactions
		SET consumed_at = NOW()
		WHERE state_hash = $1 AND consumed_at IS NULL AND expires_at > NOW()
		RETURNING nonce_hash, code_verifier_encrypted, return_to
	`, hash(state)).Scan(&nonceHash, &verifierEncrypted, &destination)
	if err != nil {
		writeError(w, http.StatusBadRequest, "State login tidak valid atau sudah digunakan.")
		return
	}

	verifier, err := a.Cipher.Decrypt(verifierEncrypted)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Transaksi login tidak valid.")
		return
	}
	oauthContext := context.WithValue(r.Context(), oauth2.HTTPClient, a.HTTPClient)
	oauthConfig := a.oauthConfig()
	token, err := oauthConfig.Exchange(
		oauthContext,
		code,
		oauth2.SetAuthURLParam("code_verifier", verifier),
	)
	if err != nil {
		writeUpstreamError(w, err, "SSO tidak dapat memproses login.")
		return
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok || rawIDToken == "" {
		writeError(w, http.StatusUnauthorized, "ID token SSO tidak tersedia.")
		return
	}
	idToken, err := a.Provider.Verifier(&oidc.Config{ClientID: a.Config.SSOClientID}).Verify(r.Context(), rawIDToken)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "ID token SSO tidak valid.")
		return
	}
	var claims struct {
		Nonce string `json:"nonce"`
		Sub   string `json:"sub"`
	}
	if err := idToken.Claims(&claims); err != nil || claims.Sub == "" || !equalHash(hash(claims.Nonce), nonceHash) {
		writeError(w, http.StatusUnauthorized, "Nonce SSO tidak valid.")
		return
	}

	userinfo, err := a.Provider.UserInfo(oauthContext, oauth2.StaticTokenSource(token))
	if err != nil {
		writeUpstreamError(w, err, "Profil SSO tidak tersedia.")
		return
	}
	var user ssoUser
	if err := userinfo.Claims(&user); err != nil || user.Sub == "" || user.Sub != claims.Sub {
		writeError(w, http.StatusUnauthorized, "Profil SSO tidak valid.")
		return
	}

	name := strings.TrimSpace(first(user.Name, user.DisplayName))
	phone := strings.TrimSpace(first(user.PhoneNumber, user.Phone, user.Mobile))
	gender := normalizeGender(first(user.Gender, user.JenisKelamin))
	phoneEncrypted, err := a.Cipher.Encrypt(phone)
	if err != nil {
		writeInternalError(w, err, "Profil lokal gagal dibuat.")
		return
	}
	rawSession, err := randomValue()
	if err != nil {
		writeInternalError(w, err, "Sesi gagal dibuat.")
		return
	}

	tx, err := a.DB.Begin(r.Context())
	if err != nil {
		writeInternalError(w, err, "Profil lokal gagal dibuat.")
		return
	}
	defer func() { _ = tx.Rollback(r.Context()) }()

	userID := uuid.NewString()
	err = tx.QueryRow(r.Context(), `
		INSERT INTO users
			(id, sso_subject, email, display_name, avatar_url, sso_phone_encrypted, gender, last_login_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		ON CONFLICT (sso_subject) DO UPDATE SET
			email = EXCLUDED.email,
			display_name = EXCLUDED.display_name,
			avatar_url = EXCLUDED.avatar_url,
			sso_phone_encrypted = EXCLUDED.sso_phone_encrypted,
			gender = EXCLUDED.gender,
			last_login_at = NOW(),
			updated_at = NOW()
		RETURNING id
	`, userID, user.Sub, strings.TrimSpace(user.Email), name, strings.TrimSpace(user.AvatarURL), phoneEncrypted, gender).Scan(&userID)
	if err != nil {
		writeInternalError(w, err, "Profil lokal gagal dibuat.")
		return
	}

	_, err = tx.Exec(r.Context(), `
		INSERT INTO member_profiles (id, user_id, full_name, gender, phone_encrypted, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			full_name = EXCLUDED.full_name,
			gender = EXCLUDED.gender,
			phone_encrypted = EXCLUDED.phone_encrypted,
			updated_at = NOW()
	`, uuid.New(), userID, name, gender, phoneEncrypted)
	if err != nil {
		writeInternalError(w, err, "Profil anggota gagal dibuat.")
		return
	}

	expiresAt := time.Now().Add(a.Config.SessionTTL)
	_, err = tx.Exec(r.Context(), `
		INSERT INTO sessions (id, user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`, uuid.New(), userID, hash(rawSession), expiresAt)
	if err != nil {
		writeInternalError(w, err, "Sesi gagal dibuat.")
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		writeInternalError(w, err, "Sesi gagal dibuat.")
		return
	}

	http.SetCookie(w, a.sessionCookie(rawSession, expiresAt, int(a.Config.SessionTTL.Seconds())))
	a.redirectWithMessage(w, r, safeReturnTo(destination), "msg", "login_success")
}

func (a *Auth) oauthConfig() oauth2.Config {
	return oauth2.Config{
		ClientID:     a.Config.SSOClientID,
		ClientSecret: a.Config.SSOClientSecret,
		Endpoint:     a.Provider.Endpoint(),
		RedirectURL:  a.Config.SSORedirectURL,
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}
}

func (a *Auth) sessionCookie(value string, expires time.Time, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     a.Config.SessionCookieName,
		Value:    value,
		Path:     "/",
		Expires:  expires,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   a.Config.SessionCookieSecure,
		SameSite: http.SameSiteLaxMode,
	}
}

func (a *Auth) redirectWithMessage(w http.ResponseWriter, r *http.Request, path, key, message string) {
	target, err := url.Parse(a.Config.FrontendURL + safeReturnTo(path))
	if err != nil {
		writeInternalError(w, err, "Redirect tidak valid.")
		return
	}
	query := target.Query()
	query.Set(key, message)
	target.RawQuery = query.Encode()
	http.Redirect(w, r, target.String(), http.StatusFound)
}

func randomValue() (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", fmt.Errorf("membuat nilai acak: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

func hash(value string) []byte {
	result := sha256.Sum256([]byte(value))
	return result[:]
}

func safeReturnTo(value string) string {
	if value == "" {
		return "/profile"
	}
	parsed, err := url.Parse(value)
	if err != nil || parsed.IsAbs() || parsed.Host != "" || !strings.HasPrefix(parsed.Path, "/") || strings.HasPrefix(value, "//") {
		return "/profile"
	}
	return parsed.RequestURI()
}

func equalHash(left, right []byte) bool {
	if len(left) != len(right) {
		return false
	}
	var result byte
	for index := range left {
		result |= left[index] ^ right[index]
	}
	return result == 0
}

func first(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func normalizeGender(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "l", "male", "laki-laki", "pria":
		return "L"
	case "p", "female", "perempuan", "wanita":
		return "P"
	default:
		return ""
	}
}
