package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ipnu-ippnu/sistem-anggota/backend/internal/config"
	"github.com/ipnu-ippnu/sistem-anggota/backend/internal/cryptox"
	"github.com/ipnu-ippnu/sistem-anggota/backend/internal/httpapi"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	_ = godotenv.Load()
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	startupContext, cancelStartup := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelStartup()
	pool, err := pgxpool.New(startupContext, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()
	if err := pool.Ping(startupContext); err != nil {
		return err
	}

	cipher, err := cryptox.New(cfg.EncryptionKey)
	if err != nil {
		return err
	}
	api, err := httpapi.NewAuth(startupContext, cfg, pool, cipher)
	if err != nil {
		return err
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/auth/login", api.Login)
	mux.HandleFunc("GET /api/v1/auth/callback", api.Callback)
	mux.HandleFunc("GET /api/v1/auth/session", api.Session)
	mux.HandleFunc("POST /api/v1/auth/logout", api.Logout)
	mux.HandleFunc("GET /api/v1/profile", api.Profile)
	mux.HandleFunc("PATCH /api/v1/profile", api.SaveProfile)
	mux.HandleFunc("POST /api/v1/profile", api.SaveProfile)
	mux.HandleFunc("POST /api/v1/profile/submit", api.SubmitProfile)
	mux.HandleFunc("POST /api/v1/integrations/laci/member-status", api.WebhookMemberStatus)
	mux.HandleFunc("GET /api/v1/organizations", api.Organizations)
	mux.HandleFunc("GET /health/live", func(w http.ResponseWriter, _ *http.Request) {
		writeHealth(w, http.StatusOK, `{"status":"ok"}`)
	})
	mux.HandleFunc("GET /health/ready", func(w http.ResponseWriter, r *http.Request) {
		if err := pool.Ping(r.Context()); err != nil {
			writeHealth(w, http.StatusServiceUnavailable, `{"status":"unavailable"}`)
			return
		}
		writeHealth(w, http.StatusOK, `{"status":"ok"}`)
	})

	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           httpapi.Middleware(mux),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	serverError := make(chan error, 1)
	go func() {
		log.Printf("API listening on %s", cfg.HTTPAddr)
		serverError <- server.ListenAndServe()
	}()

	shutdownSignal, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	select {
	case err := <-serverError:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	case <-shutdownSignal.Done():
		shutdownContext, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancelShutdown()
		return server.Shutdown(shutdownContext)
	}
}

func writeHealth(w http.ResponseWriter, status int, body string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(body))
}
