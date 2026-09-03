package config

import (
	"encoding/base64"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	defaultHTTPAddr      = ":8090"
	defaultSessionTTL    = 24 * time.Hour
	defaultClientTimeout = 10 * time.Second
)

// Config contains runtime configuration. Secrets are loaded from the
// environment and never have source-code defaults.
type Config struct {
	AppEnv              string
	HTTPAddr            string
	DatabaseURL         string
	FrontendURL         string
	SSOIssuer           string
	SSOClientID         string
	SSOClientSecret     string
	SSORedirectURL      string
	SessionCookieName   string
	SessionCookieSecure bool
	SessionTTL          time.Duration
	HTTPClientTimeout   time.Duration
	EncryptionKey       []byte
	LaciAPIURL          string
	LaciAPIKey          string
	LaciWebhookSecret   string
}

func Load() (Config, error) {
	databaseURL, err := required("DATABASE_URL")
	if err != nil {
		return Config{}, err
	}
	frontendURL, err := requiredURL("FRONTEND_URL")
	if err != nil {
		return Config{}, err
	}
	issuerURL, err := requiredURL("SSO_ISSUER")
	if err != nil {
		return Config{}, err
	}
	clientID, err := required("SSO_CLIENT_ID")
	if err != nil {
		return Config{}, err
	}
	clientSecret, err := required("SSO_CLIENT_SECRET")
	if err != nil {
		return Config{}, err
	}
	redirectURL, err := requiredURL("SSO_REDIRECT_URL")
	if err != nil {
		return Config{}, err
	}

	keyValue, err := required("ENCRYPTION_KEY")
	if err != nil {
		return Config{}, err
	}
	key, err := base64.StdEncoding.DecodeString(keyValue)
	if err != nil || len(key) != 32 {
		return Config{}, fmt.Errorf("ENCRYPTION_KEY harus base64 dari tepat 32 byte")
	}

	sessionTTL, err := duration("SESSION_TTL", defaultSessionTTL)
	if err != nil {
		return Config{}, err
	}
	clientTimeout, err := duration("HTTP_CLIENT_TIMEOUT", defaultClientTimeout)
	if err != nil {
		return Config{}, err
	}
	cookieSecure, err := boolean("SESSION_COOKIE_SECURE", false)
	if err != nil {
		return Config{}, err
	}

	appEnv := value("APP_ENV", "development")
	if appEnv == "production" && !cookieSecure {
		return Config{}, fmt.Errorf("SESSION_COOKIE_SECURE wajib true pada production")
	}

	laciURL := strings.TrimRight(value("LACI_API_URL", ""), "/")
	if laciURL != "" {
		if _, err := parseHTTPURL("LACI_API_URL", laciURL); err != nil {
			return Config{}, err
		}
	}

	return Config{
		AppEnv:              appEnv,
		HTTPAddr:            value("HTTP_ADDR", defaultHTTPAddr),
		DatabaseURL:         databaseURL,
		FrontendURL:         strings.TrimRight(frontendURL, "/"),
		SSOIssuer:           strings.TrimRight(issuerURL, "/"),
		SSOClientID:         clientID,
		SSOClientSecret:     clientSecret,
		SSORedirectURL:      redirectURL,
		SessionCookieName:   value("SESSION_COOKIE_NAME", "anggota_session"),
		SessionCookieSecure: cookieSecure,
		SessionTTL:          sessionTTL,
		HTTPClientTimeout:   clientTimeout,
		EncryptionKey:       key,
		LaciAPIURL:          laciURL,
		LaciAPIKey:          value("LACI_API_KEY", ""),
		LaciWebhookSecret:   value("LACI_WEBHOOK_SECRET", ""),
	}, nil
}

func required(name string) (string, error) {
	if result := strings.TrimSpace(os.Getenv(name)); result != "" {
		return result, nil
	}
	return "", fmt.Errorf("environment %s wajib diisi", name)
}

func requiredURL(name string) (string, error) {
	value, err := required(name)
	if err != nil {
		return "", err
	}
	return parseHTTPURL(name, value)
}

func parseHTTPURL(name, input string) (string, error) {
	parsed, err := url.Parse(input)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return "", fmt.Errorf("environment %s harus berupa URL HTTP(S) yang valid", name)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return "", fmt.Errorf("environment %s harus memakai skema http atau https", name)
	}
	return input, nil
}

func duration(name string, fallback time.Duration) (time.Duration, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return fallback, nil
	}
	result, err := time.ParseDuration(raw)
	if err != nil || result <= 0 {
		return 0, fmt.Errorf("environment %s harus berupa durasi positif", name)
	}
	return result, nil
}

func boolean(name string, fallback bool) (bool, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return fallback, nil
	}
	result, err := strconv.ParseBool(raw)
	if err != nil {
		return false, fmt.Errorf("environment %s harus berupa boolean", name)
	}
	return result, nil
}

func value(name, fallback string) string {
	if result := strings.TrimSpace(os.Getenv(name)); result != "" {
		return result
	}
	return fallback
}
