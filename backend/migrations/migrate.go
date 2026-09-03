package migrations

import (
	"bytes"
	"context"
	"crypto/sha256"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed *.sql
var files embed.FS

func Run(ctx context.Context, pool *pgxpool.Pool) error {
	connection, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquire migration connection: %w", err)
	}
	defer connection.Release()

	if _, err := connection.Exec(ctx, `SELECT pg_advisory_lock(84729103)`); err != nil {
		return fmt.Errorf("lock migrations: %w", err)
	}
	defer func() { _, _ = connection.Exec(context.Background(), `SELECT pg_advisory_unlock(84729103)`) }()

	if _, err := connection.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			checksum BYTEA NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}
	if err := importLegacyPrismaMigrations(ctx, connection.Conn()); err != nil {
		return err
	}

	entries, err := fs.Glob(files, "*.sql")
	if err != nil {
		return fmt.Errorf("list migrations: %w", err)
	}
	sort.Strings(entries)
	for _, filename := range entries {
		migration, err := files.ReadFile(filename)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", filename, err)
		}
		version := strings.TrimSuffix(filename, ".sql")
		checksum := sha256.Sum256(migration)
		applied, err := migrationApplied(ctx, connection.Conn(), version, checksum[:])
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		transaction, err := connection.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin migration %s: %w", version, err)
		}
		if _, err := transaction.Exec(ctx, string(migration)); err != nil {
			_ = transaction.Rollback(ctx)
			return fmt.Errorf("apply migration %s: %w", version, err)
		}
		if _, err := transaction.Exec(ctx, `
			INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)
		`, version, checksum[:]); err != nil {
			_ = transaction.Rollback(ctx)
			return fmt.Errorf("record migration %s: %w", version, err)
		}
		if err := transaction.Commit(ctx); err != nil {
			return fmt.Errorf("commit migration %s: %w", version, err)
		}
	}
	return nil
}

func migrationApplied(ctx context.Context, connection *pgx.Conn, version string, checksum []byte) (bool, error) {
	var existing []byte
	err := connection.QueryRow(ctx, `SELECT checksum FROM schema_migrations WHERE version = $1`, version).Scan(&existing)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check migration %s: %w", version, err)
	}
	if !bytes.Equal(existing, checksum) {
		return false, fmt.Errorf("migration %s berubah setelah diterapkan", version)
	}
	return true, nil
}

func importLegacyPrismaMigrations(ctx context.Context, connection *pgx.Conn) error {
	var exists bool
	if err := connection.QueryRow(ctx, `SELECT to_regclass('_prisma_migrations') IS NOT NULL`).Scan(&exists); err != nil {
		return fmt.Errorf("check legacy migrations: %w", err)
	}
	if !exists {
		return nil
	}
	rows, err := connection.Query(ctx, `
		SELECT migration_name FROM _prisma_migrations
		WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
	`)
	if err != nil {
		return fmt.Errorf("read legacy migrations: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return fmt.Errorf("scan legacy migration: %w", err)
		}
		migration, err := files.ReadFile(version + ".sql")
		if errors.Is(err, fs.ErrNotExist) {
			continue
		}
		if err != nil {
			return fmt.Errorf("read legacy migration %s: %w", version, err)
		}
		checksum := sha256.Sum256(migration)
		if _, err := connection.Exec(ctx, `
			INSERT INTO schema_migrations (version, checksum)
			VALUES ($1, $2)
			ON CONFLICT (version) DO NOTHING
		`, version, checksum[:]); err != nil {
			return fmt.Errorf("import legacy migration %s: %w", version, err)
		}
	}
	return rows.Err()
}
