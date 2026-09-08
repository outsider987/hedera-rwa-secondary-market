FROM golang:1.27.1 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /api ./cmd/api
RUN mkdir -p /licenses && cp /usr/local/go/LICENSE /licenses/Go-LICENSE && \
    CGO_ENABLED=0 go list -deps -f '{{if .Module}}{{.Module.Dir}}{{end}}' ./cmd/api | sort -u | \
    while read module; do \
      for notice in "$module"/LICENSE* "$module"/COPYING* "$module"/NOTICE*; do \
        if [ -f "$notice" ]; then \
          destination=$(echo "$module" | tr '/' '_'); \
          mkdir -p "/licenses/$destination"; cp "$notice" "/licenses/$destination/"; \
        fi; \
      done; \
    done
FROM scratch
USER 65532:65532
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /api /api
COPY --from=build /licenses /licenses
COPY --from=build /usr/share/doc/ca-certificates/copyright /licenses/ca-certificates-copyright
EXPOSE 8787
ENTRYPOINT ["/api"]
