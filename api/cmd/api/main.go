// Command api runs the infracringe HTTP API.
//
//	api           start the HTTP server
//	api migrate   apply database migrations and exit
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cybercringe2520/infracringe-app/api/internal/db"
	"github.com/cybercringe2520/infracringe-app/api/internal/server"
	"github.com/cybercringe2520/infracringe-app/api/internal/views"
)

func main() {
	// JSON logs to stdout: easy for Kubernetes and Elasticsearch to collect.
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	if err := run(logger); err != nil {
		logger.Error("stopped with error", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	// All configuration comes from environment variables.
	// DATABASE_URL contains a password, so it is never logged.
	port := getenv("PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")

	// Stop cleanly on Ctrl+C (SIGINT) or when Kubernetes stops the pod (SIGTERM).
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// "api migrate": run migrations and exit. Later this runs as a Kubernetes Job.
	if len(os.Args) > 1 && os.Args[1] == "migrate" {
		if dbURL == "" {
			return errors.New("DATABASE_URL is required for migrate")
		}
		logger.Info("running migrations")
		if err := db.Migrate(ctx, dbURL); err != nil {
			return err
		}
		logger.Info("migrations complete")
		return nil
	}

	// Choose the view store: PostgreSQL if configured, otherwise in-memory.
	var store views.Store
	var ready func(context.Context) error
	if dbURL == "" {
		logger.Warn("DATABASE_URL not set: using in-memory store, counts are lost on restart")
		store = views.NewMemoryStore()
	} else {
		connectCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
		pool, err := db.Connect(connectCtx, dbURL)
		cancel()
		if err != nil {
			return err
		}
		defer pool.Close()
		logger.Info("connected to database")
		store = views.NewPostgresStore(pool)
		ready = pool.Ping
	}

	srv := server.New(store, logger, ready)

	httpServer := &http.Server{
		Addr:              ":" + port,
		Handler:           srv.Routes(),
		ReadHeaderTimeout: 5 * time.Second, // protects against slow-header (Slowloris) attacks
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		logger.Info("starting server", "port", port)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	// Finish in-flight requests, but give up after 10 seconds.
	logger.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return httpServer.Shutdown(shutdownCtx)
}

func getenv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
