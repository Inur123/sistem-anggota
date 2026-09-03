package cryptox

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"
	"io"
)

type AESGCM struct{ aead cipher.AEAD }

func New(key []byte) (*AESGCM, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return &AESGCM{aead: aead}, nil
}
func (c *AESGCM) Encrypt(value string) ([]byte, error) {
	if value == "" {
		return nil, nil
	}
	nonce := make([]byte, c.aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	return c.aead.Seal(nonce, nonce, []byte(value), nil), nil
}
func (c *AESGCM) Decrypt(value []byte) (string, error) {
	if len(value) == 0 {
		return "", nil
	}
	size := c.aead.NonceSize()
	if len(value) < size {
		return "", fmt.Errorf("ciphertext tidak valid")
	}
	plain, err := c.aead.Open(nil, value[:size], value[size:], nil)
	return string(plain), err
}
