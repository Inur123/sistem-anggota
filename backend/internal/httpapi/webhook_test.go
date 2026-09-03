package httpapi

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"testing"
)

func TestValidWebhookSignature(t *testing.T) {
	body := []byte(`{"eventId":"evt-1"}`)
	hash := hmac.New(sha256.New, []byte("secret"))
	_, _ = hash.Write(body)
	signature := hex.EncodeToString(hash.Sum(nil))

	if !validWebhookSignature(body, signature, "secret") {
		t.Fatal("validWebhookSignature() rejected a valid signature")
	}
	if validWebhookSignature(body, signature, "different") {
		t.Fatal("validWebhookSignature() accepted an invalid secret")
	}
}

func TestMapWebhookStatus(t *testing.T) {
	if got, ok := mapWebhookStatus("APPROVED"); !ok || got != "DITERIMA" {
		t.Fatalf("mapWebhookStatus(APPROVED) = %q, %v", got, ok)
	}
	if _, ok := mapWebhookStatus("UNKNOWN"); ok {
		t.Fatal("mapWebhookStatus(UNKNOWN) should be rejected")
	}
}
