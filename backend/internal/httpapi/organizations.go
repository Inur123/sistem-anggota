package httpapi

import (
	"io"
	"net/http"
	"strings"
)

func (a *Auth) Organizations(w http.ResponseWriter, r *http.Request) {
	if _, ok := a.sessionUser(r); !ok {
		writeError(w, http.StatusUnauthorized, "Belum login.")
		return
	}
	if a.Config.LaciAPIURL == "" || a.Config.LaciAPIKey == "" || strings.HasPrefix(a.Config.LaciAPIKey, "isi_") {
		writeError(w, http.StatusServiceUnavailable, "Laci belum dikonfigurasi.")
		return
	}

	request, err := http.NewRequestWithContext(r.Context(), http.MethodGet, a.Config.LaciAPIURL+"/public/organisasi", nil)
	if err != nil {
		writeInternalError(w, err, "Konfigurasi Laci tidak valid.")
		return
	}
	request.Header.Set("X-API-Key", a.Config.LaciAPIKey)
	if correlationID, randomErr := randomValue(); randomErr == nil {
		request.Header.Set("X-Correlation-ID", correlationID)
	}

	response, err := a.HTTPClient.Do(request)
	if err != nil {
		writeUpstreamError(w, err, "Laci tidak dapat dihubungi.")
		return
	}
	defer response.Body.Close()

	body, err := io.ReadAll(io.LimitReader(response.Body, maxRequestBodySize+1))
	if err != nil {
		writeUpstreamError(w, err, "Respons Laci tidak dapat dibaca.")
		return
	}
	if len(body) > maxRequestBodySize {
		writeError(w, http.StatusBadGateway, "Respons Laci terlalu besar.")
		return
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		writeError(w, http.StatusBadGateway, "Gagal mengambil organisasi dari Laci.")
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(body)
}
