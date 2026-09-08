CREATE TABLE IF NOT EXISTS markets (
 id text PRIMARY KEY CHECK (id = 'NOVA/HBAR'),
 salt text NOT NULL,
 sequence bigint NOT NULL DEFAULT 0 CHECK(sequence >= 0),
 effective_time bigint NOT NULL DEFAULT 0 CHECK(effective_time >= 0),
 version bigint NOT NULL DEFAULT 0 CHECK(version >= 0)
);
CREATE TABLE IF NOT EXISTS commands (
 id text PRIMARY KEY,
 market text NOT NULL REFERENCES markets(id),
 prepared jsonb NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','accepted','rejected','expired')),
 signature text,
 digest text,
 result jsonb,
 reason text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS orders (
 id text PRIMARY KEY,
 market text NOT NULL REFERENCES markets(id),
 sequence bigint NOT NULL,
 data jsonb NOT NULL,
 UNIQUE(market, sequence)
);
CREATE TABLE IF NOT EXISTS matches (
 id text PRIMARY KEY,
 market text NOT NULL REFERENCES markets(id),
 data jsonb NOT NULL
);
