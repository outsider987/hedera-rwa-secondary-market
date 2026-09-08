CREATE TABLE IF NOT EXISTS settlement_deployment (
 market text PRIMARY KEY REFERENCES markets(id),
 address text NOT NULL UNIQUE,
 cutoff bigint NOT NULL CHECK(cutoff >= 0),
 evidence jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS settlements (
 id text PRIMARY KEY REFERENCES matches(id),
 seller text NOT NULL,
 hold_id bigint,
 data jsonb NOT NULL,
 UNIQUE(seller,hold_id)
);
CREATE TABLE IF NOT EXISTS settlement_operations (
 id text PRIMARY KEY,
 settlement_id text REFERENCES settlements(id),
 action text NOT NULL CHECK(action IN ('deploy','lock','register','settle','cancel','reclaim','orphan')),
 status text NOT NULL CHECK(status IN ('prepared','pending','verified','reverted')),
 transaction_hash text UNIQUE,
 data jsonb NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS settlement_one_pending ON settlement_operations ((true)) WHERE status IN ('prepared','pending');
CREATE TABLE IF NOT EXISTS settlement_events (
 transaction_hash text NOT NULL,
 log_index bigint NOT NULL,
 operation_id text NOT NULL REFERENCES settlement_operations(id),
 PRIMARY KEY(transaction_hash,log_index)
);
