// Package views stores how many times each article has been viewed.
package views

import (
	"context"
	"sync"
)

// Store is anything that can read and increment view counts.
// The in-memory version below is used now; a PostgreSQL version
// replaces it later without the HTTP handlers changing.
type Store interface {
	Get(ctx context.Context, slug string) (int64, error)
	Increment(ctx context.Context, slug string) (int64, error)
}

// MemoryStore keeps counts in a map. Counts are lost on restart.
type MemoryStore struct {
	mu     sync.Mutex
	counts map[string]int64
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{counts: make(map[string]int64)}
}

func (s *MemoryStore) Get(_ context.Context, slug string) (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.counts[slug], nil
}

func (s *MemoryStore) Increment(_ context.Context, slug string) (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.counts[slug]++
	return s.counts[slug], nil
}
