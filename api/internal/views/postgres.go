package views

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"

	"github.com/cybercringe2520/infracringe-app/api/internal/db/dbgen"
)

// PostgresStore keeps view counts in the page_views table.
type PostgresStore struct {
	queries *dbgen.Queries
}

func NewPostgresStore(conn dbgen.DBTX) *PostgresStore {
	return &PostgresStore{queries: dbgen.New(conn)}
}

func (s *PostgresStore) Get(ctx context.Context, slug string) (int64, error) {
	views, err := s.queries.GetViews(ctx, slug)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, nil // never viewed yet
	}
	return views, err
}

func (s *PostgresStore) Increment(ctx context.Context, slug string) (int64, error) {
	return s.queries.IncrementViews(ctx, slug)
}
