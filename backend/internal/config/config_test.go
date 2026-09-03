package config

import (
	"encoding/base64"
	"strings"
	"testing"
)

func setValidEnvironment(t *testing.T) {
	t.Helper()
	t.Setenv("APP_ENV", "development")
	t.Setenv("DATABASE_URL", "postgresql://localhost/sistem_anggota")
	t.Setenv("FRONTEND_URL", "http://localhost:3100")
	t.Setenv("SSO_ISSUER", "https://sso.example.com")
	t.Setenv("SSO_CLIENT_ID", "client-id")
	t.Setenv("SSO_CLIENT_SECRET", "client-secret")
	t.Setenv("SSO_REDIRECT_URL", "http://localhost:3100/callback")
	t.Setenv("ENCRYPTION_KEY", base64.StdEncoding.EncodeToString(make([]byte, 32)))
}

func TestLoad(t *testing.T) {
	setValidEnvironment(t)
	t.Setenv("SESSION_TTL", "12h")
	t.Setenv("SESSION_COOKIE_SECURE", "true")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if got := cfg.SessionTTL.Hours(); got != 12 {
		t.Fatalf("SessionTTL = %v hours, want 12", got)
	}
	if !cfg.SessionCookieSecure {
		t.Fatal("SessionCookieSecure = false, want true")
	}
}

func TestLoadReportsMissingEnvironment(t *testing.T) {
	setValidEnvironment(t)
	t.Setenv("DATABASE_URL", "")

	_, err := Load()
	if err == nil || !strings.Contains(err.Error(), "DATABASE_URL") {
		t.Fatalf("Load() error = %v, want DATABASE_URL error", err)
	}
}

func TestLoadRejectsInsecureProductionCookie(t *testing.T) {
	setValidEnvironment(t)
	t.Setenv("APP_ENV", "production")
	t.Setenv("SESSION_COOKIE_SECURE", "false")

	_, err := Load()
	if err == nil || !strings.Contains(err.Error(), "SESSION_COOKIE_SECURE") {
		t.Fatalf("Load() error = %v, want secure cookie error", err)
	}
}
