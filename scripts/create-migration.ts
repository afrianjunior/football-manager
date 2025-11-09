#!/usr/bin/env bun

import { writeFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = "/Users/afrianjunior/Workplace/experimental/football-manager/migrations";

function getNextMigrationNumber(): number {
  const now = new Date();
  const timestamp = now.getTime();
  return timestamp;
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function createMigration(name: string) {
  if (!name) {
    console.error("❌ Please provide a migration name");
    console.log("Usage: bun create-migration.ts <migration_name>");
    console.log("Example: bun create-migration.ts addUserRoles");
    process.exit(1);
  }

  const migrationNumber = getNextMigrationNumber();
  const migrationName = toSnakeCase(name);
  const filename = `${migrationNumber}_${migrationName}.sql`;
  const filepath = join(MIGRATIONS_DIR, filename);

  const template = `-- UP
-- ${name} migration

-- Add your up migration here


-- DOWN
-- ${name} rollback

-- Add your down migration here
`;

  try {
    await writeFile(filepath, template, "utf-8");
    console.log(`✅ Created migration: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
    console.log("\n📝 Next steps:");
    console.log("1. Edit the migration file to add your SQL queries");
    console.log("2. Run 'bun migration:up' to apply the migration");
    console.log("3. Run 'bun migration:status' to check status");
  } catch (error) {
    console.error("❌ Error creating migration:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  const migrationName = process.argv[2];
  createMigration(migrationName);
}