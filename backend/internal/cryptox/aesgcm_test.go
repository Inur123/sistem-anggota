package cryptox

import (
	"bytes"
	"testing"
)

func TestRoundTrip(t *testing.T) {
	cipher, err := New(bytes.Repeat([]byte{1}, 32))
	if err != nil {
		t.Fatal(err)
	}

	encrypted, err := cipher.Encrypt("data anggota")
	if err != nil {
		t.Fatal(err)
	}
	plain, err := cipher.Decrypt(encrypted)
	if err != nil {
		t.Fatal(err)
	}
	if plain != "data anggota" {
		t.Fatalf("Decrypt() = %q, want %q", plain, "data anggota")
	}
}

func TestTamperedCiphertextFails(t *testing.T) {
	cipher, err := New(bytes.Repeat([]byte{2}, 32))
	if err != nil {
		t.Fatal(err)
	}

	encrypted, err := cipher.Encrypt("rahasia")
	if err != nil {
		t.Fatal(err)
	}
	encrypted[len(encrypted)-1] ^= 1
	if _, err := cipher.Decrypt(encrypted); err == nil {
		t.Fatal("Decrypt() succeeded for tampered ciphertext")
	}
}
