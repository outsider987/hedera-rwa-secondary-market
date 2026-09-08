package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"holdbook/engine/internal/service"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	// Dedicated local Compose network; no wallet or application secrets.
	store, e := service.Open(ctx, "postgres://holdbook@db:5432/holdbook?sslmode=disable")
	if e != nil {
		log.Print("Database initialization failed")
		os.Exit(1)
	}
	defer store.Pool.Close()
	go store.Tick(ctx)
	server := &http.Server{Addr: ":8787", Handler: service.Handler(store), ReadHeaderTimeout: 3 * time.Second, ReadTimeout: 12 * time.Second, WriteTimeout: 190 * time.Second, IdleTimeout: 30 * time.Second, MaxHeaderBytes: 8192}
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdown)
	}()
	log.Print("HoldBook unfunded intent API ready")
	if e = server.ListenAndServe(); e != nil && e != http.ErrServerClosed {
		log.Print("API stopped unexpectedly")
		os.Exit(1)
	}
}
