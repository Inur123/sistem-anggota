.PHONY: db-up migrate backend frontend backend-test backend-vet frontend-check audit

db-up:
	brew services start postgresql@17 || brew services start postgresql
	createdb -p 5432 sistem_anggota 2>/dev/null || true

migrate:
	cd backend && go run ./cmd/migrate

backend:
	cd backend && go run ./cmd/api

frontend:
	cd frontend && npm run dev

backend-test:
	cd backend && go test -race ./...

backend-vet:
	cd backend && go vet ./...

frontend-check:
	cd frontend && npm run typecheck && npm run lint && npm run build

audit: backend-test backend-vet frontend-check
