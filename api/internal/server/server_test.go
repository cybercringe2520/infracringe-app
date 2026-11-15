package server

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/cybercringe2520/infracringe-app/api/internal/views"
)

func newTestServer() http.Handler {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	return New(views.NewMemoryStore(), logger).Routes()
}

func TestHealthz(t *testing.T) {
	rec := httptest.NewRecorder()
	newTestServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
}

func TestViewsIncrement(t *testing.T) {
	h := newTestServer()

	// Two POSTs, then a GET: the count should be 2.
	for range 2 {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/views/post0", nil))
		if rec.Code != http.StatusOK {
			t.Fatalf("POST status = %d, want 200", rec.Code)
		}
	}

	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/views/post0", nil))

	var body struct {
		Slug  string `json:"slug"`
		Views int64  `json:"views"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body.Views != 2 {
		t.Fatalf("views = %d, want 2", body.Views)
	}
}

func TestInvalidSlug(t *testing.T) {
	// Each of these should be rejected with 400 Bad Request.
	for _, slug := range []string{"UPPER", "has_underscore", "dots..dots", "x%3Cscript%3E"} {
		rec := httptest.NewRecorder()
		newTestServer().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/views/"+slug, nil))
		if rec.Code != http.StatusBadRequest {
			t.Errorf("slug %q: status = %d, want 400", slug, rec.Code)
		}
	}
}
