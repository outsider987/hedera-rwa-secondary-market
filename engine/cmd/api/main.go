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
	cfg, e := readConfig(os.Getenv)
	if e != nil {
		log.Print(e.Error())
		os.Exit(1)
	}
	// Never log connection strings or database errors containing credentials.
	startup, cancelStartup := context.WithTimeout(ctx, 30*time.Second)
	store, e := service.Open(startup, cfg.databaseURL)
	cancelStartup()
	if e != nil {
		log.Print("Database initialization failed")
		os.Exit(1)
	}
	defer store.Pool.Close()
	// Cloud Run can suspend background CPU; requests already expire stale orders.
	if cfg.host == "" {
		go store.Tick(ctx)
	}
	server := &http.Server{Addr: ":" + cfg.port, Handler: service.Handler(store, cfg.origin, cfg.host), ReadHeaderTimeout: 3 * time.Second, ReadTimeout: 12 * time.Second, WriteTimeout: 190 * time.Second, IdleTimeout: 30 * time.Second, MaxHeaderBytes: 8192}
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
