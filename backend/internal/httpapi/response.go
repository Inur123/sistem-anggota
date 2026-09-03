package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
)

const maxRequestBodySize = 1 << 20

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"message": message})
}

func writeInternalError(w http.ResponseWriter, err error, publicMessage string) {
	log.Printf("internal error: %v", err)
	writeError(w, http.StatusInternalServerError, publicMessage)
}

func writeUpstreamError(w http.ResponseWriter, err error, publicMessage string) {
	log.Printf("upstream error: %v", err)
	writeError(w, http.StatusBadGateway, publicMessage)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBodySize)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("request body hanya boleh berisi satu objek JSON")
	}
	return nil
}
