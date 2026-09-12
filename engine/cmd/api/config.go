package main

import (
	"errors"
	"net"
	"net/url"
	"strconv"
)

type config struct{ port, databaseURL, origin, host string }

func readConfig(getenv func(string) string) (config, error) {
	c := config{port: getenv("PORT"), databaseURL: getenv("DATABASE_URL"), origin: getenv("PUBLIC_ORIGIN"), host: getenv("API_HOST")}
	remote := getenv("K_SERVICE") != "" || c.origin != "" || c.host != ""
	if c.port == "" {
		c.port = "8787"
	}
	port, e := strconv.Atoi(c.port)
	if e != nil || port < 1 || port > 65535 {
		return c, errors.New("PORT must be a valid TCP port")
	}
	if !remote {
		c.origin = "http://127.0.0.1:4173"
		if c.databaseURL == "" {
			c.databaseURL = "postgres://holdbook@db:5432/holdbook?sslmode=disable"
		}
		return c, nil
	}
	u, e := url.Parse(c.origin)
	if e != nil || u.Scheme != "https" || u.Host == "" || u.User != nil || u.RawQuery != "" || u.Fragment != "" || u.Path != "" || u.String() != u.Scheme+"://"+u.Host {
		return c, errors.New("PUBLIC_ORIGIN must be an exact HTTPS origin without a trailing slash")
	}
	if c.host == "" || net.ParseIP(c.host) != nil {
		return c, errors.New("API_HOST must be the deployed API hostname")
	}
	h, e := url.Parse("https://" + c.host)
	if e != nil || h.Host != c.host || h.User != nil || h.Path != "" || h.RawQuery != "" || h.Fragment != "" {
		return c, errors.New("API_HOST must contain only the deployed API hostname")
	}
	db, e := url.Parse(c.databaseURL)
	if e != nil || (db.Scheme != "postgres" && db.Scheme != "postgresql") || db.Host == "" || (db.Query().Get("sslmode") != "require" && db.Query().Get("sslmode") != "verify-full") {
		return c, errors.New("DATABASE_URL must be a PostgreSQL connection with TLS required")
	}
	return c, nil
}
