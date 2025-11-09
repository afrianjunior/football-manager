-- UP
-- Initial schema for football manager application
-- Migrations tracking table only

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DOWN
-- Only drop the migrations table
DROP TABLE IF EXISTS migrations;