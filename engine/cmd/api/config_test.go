package main

import "testing"

func TestCloudConfiguration(t *testing.T) {
	base := map[string]string{"K_SERVICE": "holdbook", "PORT": "8080", "PUBLIC_ORIGIN": "https://holdbook.example", "API_HOST": "holdbook-123.run.app", "DATABASE_URL": "postgres://test@example.invalid/holdbook?sslmode=require"}
	for _, item := range []struct {
		key, value string
		valid      bool
	}{{"", "", true}, {"PORT", "0", false}, {"PUBLIC_ORIGIN", "http://holdbook.example", false}, {"PUBLIC_ORIGIN", "https://holdbook.example/", false}, {"PUBLIC_ORIGIN", "", false}, {"API_HOST", "", false}, {"API_HOST", "https://holdbook.run.app", false}, {"DATABASE_URL", "", false}, {"DATABASE_URL", "postgres://test@example.invalid/holdbook?sslmode=disable", false}} {
		t.Run(item.key+item.value, func(t *testing.T) {
			get := func(k string) string {
				if k == item.key {
					return item.value
				}
				return base[k]
			}
			_, err := readConfig(get)
			if (err == nil) != item.valid {
				t.Fatalf("unexpected validation: %v", err)
			}
		})
	}
	cfg, err := readConfig(func(string) string { return "" })
	if err != nil || cfg.port != "8787" || cfg.host != "" {
		t.Fatal("local defaults changed")
	}
}
