// Package server wires up the HTTP routes and handlers.
package server

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"regexp"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/cybercringe2520/infracringe-app/api/internal/views"
)

// Only lowercase letters, digits and dashes, like the article file names.
var validSlug = regexp.MustCompile(`^[a-z0-9-]{1,100}$`)

type Server struct {
	views   views.Store
	logger  *slog.Logger
	ready   func(context.Context) error // nil means "always ready"
	metrics *metrics
}

// New creates the server. ready is called by /readyz, for example to ping the database.
func New(store views.Store, logger *slog.Logger, ready func(context.Context) error) *Server {
	return &Server{views: store, logger: logger, ready: ready, metrics: newMetrics()}
}

// Routes returns the router with all endpoints and middleware.
func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID) // give each request an ID for the logs
	r.Use(middleware.RealIP)    // use the client IP from proxy headers
	r.Use(s.instrument)         // one JSON log line and metrics per request
	r.Use(middleware.Recoverer) // turn a panic into a 500 instead of a crash

	r.Get("/healthz", s.healthz)
	r.Get("/readyz", s.readyz)
	r.Method(http.MethodGet, "/metrics", s.metrics.handler())

	r.Route("/api/views/{slug}", func(r chi.Router) {
		r.Get("/", s.getViews)
		r.Post("/", s.incrementViews)
	})

	return r
}

// healthz: the process is running. Kubernetes restarts the pod if this fails.
func (s *Server) healthz(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// readyz: the app can serve traffic. Kubernetes stops sending requests if this fails.
// With a database configured, it fails when the database cannot be reached.
func (s *Server) readyz(w http.ResponseWriter, r *http.Request) {
	if s.ready != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := s.ready(ctx); err != nil {
			s.logger.Warn("not ready", "error", err)
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "not ready"})
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (s *Server) getViews(w http.ResponseWriter, r *http.Request) {
	slug, ok := s.slugParam(w, r)
	if !ok {
		return
	}
	count, err := s.views.Get(r.Context(), slug)
	if err != nil {
		s.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"slug": slug, "views": count})
}

func (s *Server) incrementViews(w http.ResponseWriter, r *http.Request) {
	slug, ok := s.slugParam(w, r)
	if !ok {
		return
	}
	count, err := s.views.Increment(r.Context(), slug)
	if err != nil {
		s.serverError(w, r, err)
		return
	}
	s.metrics.views.Inc()
	writeJSON(w, http.StatusOK, map[string]any{"slug": slug, "views": count})
}

// slugParam reads {slug} from the URL and rejects anything that is not a valid slug.
func (s *Server) slugParam(w http.ResponseWriter, r *http.Request) (string, bool) {
	slug := chi.URLParam(r, "slug")
	if !validSlug.MatchString(slug) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid slug"})
		return "", false
	}
	return slug, true
}

// serverError logs the real error but never sends its details to the client.
func (s *Server) serverError(w http.ResponseWriter, r *http.Request, err error) {
	s.logger.Error("request failed", "error", err, "path", r.URL.Path,
		"request_id", middleware.GetReqID(r.Context()))
	writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
