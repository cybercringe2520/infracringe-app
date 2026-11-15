package server

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// metrics holds the Prometheus metrics the API exposes on /metrics.
type metrics struct {
	registry *prometheus.Registry
	requests *prometheus.CounterVec
	duration *prometheus.HistogramVec
	views    prometheus.Counter
}

func newMetrics() *metrics {
	m := &metrics{
		// A registry of our own (not the global default) keeps tests independent.
		registry: prometheus.NewRegistry(),
		requests: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "HTTP requests handled, by method, route and status code.",
		}, []string{"method", "route", "status"}),
		duration: prometheus.NewHistogramVec(prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Time taken to handle HTTP requests, by method and route.",
			Buckets: prometheus.DefBuckets, // 5 ms to 10 s
		}, []string{"method", "route"}),
		// No slug label on purpose: every new label value creates a new time series,
		// so anyone could flood Prometheus by requesting made-up slugs.
		views: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "infracringe_page_views_total",
			Help: "Article views counted, across all articles.",
		}),
	}
	m.registry.MustRegister(
		m.requests,
		m.duration,
		m.views,
		collectors.NewGoCollector(), // goroutines, memory, garbage collection
		collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}), // CPU, open files, memory
	)
	return m
}

// handler serves the metrics in the Prometheus text format.
func (m *metrics) handler() http.Handler {
	return promhttp.HandlerFor(m.registry, promhttp.HandlerOpts{})
}

// instrument logs each request and records it in the metrics.
func (s *Server) instrument(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(ww, r)
		elapsed := time.Since(start)

		// Use the route pattern ("/api/views/{slug}"), never the raw path:
		// raw paths would create a new time series for every slug and every
		// random URL a scanner tries.
		route := chi.RouteContext(r.Context()).RoutePattern()
		if route == "" {
			route = "unmatched"
		}

		s.metrics.requests.WithLabelValues(r.Method, route, strconv.Itoa(ww.Status())).Inc()
		s.metrics.duration.WithLabelValues(r.Method, route).Observe(elapsed.Seconds())

		s.logger.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"route", route,
			"status", ww.Status(),
			"duration_ms", elapsed.Milliseconds(),
			"request_id", middleware.GetReqID(r.Context()),
		)
	})
}
