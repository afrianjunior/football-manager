#!/usr/bin/env bun

import { Database } from "bun:sqlite";
import { readdir, readFile } from "fs/promises";
import { join, basename } from "path";

const projectDir = __dirname.replace('scripts', '')

const DB_PATH = `${projectDir}/db/main.db`;
const MIGRATIONS_DIR = `${projectDir}/migrations`;

interface Migration {
  version: number;
  name: string;
  up: string;
  down: string;
}

class MigrationManager {
  private db: Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initMigrationTable();
  }

  private initMigrationTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private async loadMigration(filePath: string): Promise<Migration> {
    const content = await readFile(filePath, "utf-8");
    const filename = basename(filePath, ".sql");
    const version = parseInt(filename.split("_")[0]);
    const name = filename.split("_").slice(1).join("_");

    const parts = content.split("-- DOWN");
    const up = parts[0].replace("-- UP", "").trim();
    const down = parts[1]?.trim() || "";

    return { version, name, up, down };
  }

  private async getAppliedMigrations(): Promise<number[]> {
    const result = this.db.query("SELECT version FROM migrations ORDER BY version").all() as { version: number }[];
    return result.map(row => row.version);
  }

  private async getAvailableMigrations(): Promise<Migration[]> {
    const files = await readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter(file => file.endsWith(".sql"))
      .sort((a, b) => parseInt(a.split("_")[0]) - parseInt(b.split("_")[0]));

    const migrations: Migration[] = [];
    for (const file of migrationFiles) {
      const migration = await this.loadMigration(join(MIGRATIONS_DIR, file));
      migrations.push(migration);
    }

    return migrations;
  }

  async migrateUp(targetVersion?: number) {
    console.log("🚀 Starting migration up...");
    
    const appliedMigrations = await this.getAppliedMigrations();
    const availableMigrations = await this.getAvailableMigrations();
    
    const pendingMigrations = availableMigrations.filter(migration => {
      if (targetVersion && migration.version > targetVersion) {
        return false;
      }
      return !appliedMigrations.includes(migration.version);
    });

    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations found.");
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    
    for (const migration of pendingMigrations) {
      console.log(`  → Applying migration ${migration.version}: ${migration.name}`);
      
      try {
        this.db.exec(migration.up);
        this.db.query("INSERT INTO migrations (version, name) VALUES (?, ?)").run(migration.version, migration.name);
        console.log(`  ✅ Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`  ❌ Error applying migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log("🎉 All migrations completed successfully!");
  }

  async migrateDown(targetVersion?: number) {
    console.log("⬇️  Starting migration down...");
    
    const appliedMigrations = await this.getAppliedMigrations();
    const availableMigrations = await this.getAvailableMigrations();
    
    if (appliedMigrations.length === 0) {
      console.log("✅ No migrations to rollback.");
      return;
    }

    const migrationsToRollback = availableMigrations
      .filter(migration => appliedMigrations.includes(migration.version))
      .reverse();

    if (targetVersion !== undefined) {
      const targetIndex = migrationsToRollback.findIndex(m => m.version === targetVersion);
      if (targetIndex === -1) {
        console.error(`❌ Migration version ${targetVersion} not found in applied migrations.`);
        return;
      }
      migrationsToRollback.splice(targetIndex + 1);
    }

    console.log(`📋 Found ${migrationsToRollback.length} migrations to rollback:`);
    
    for (const migration of migrationsToRollback) {
      console.log(`  → Rolling back migration ${migration.version}: ${migration.name}`);
      
      try {
        if (!migration.down) {
          console.warn(`  ⚠️  No down migration found for version ${migration.version}, skipping...`);
          continue;
        }
        
        this.db.exec(migration.down);
        this.db.query("DELETE FROM migrations WHERE version = ?").run(migration.version);
        console.log(`  ✅ Migration ${migration.version} rolled back successfully`);
      } catch (error) {
        console.error(`  ❌ Error rolling back migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log("🎉 All rollbacks completed successfully!");
  }

  async status() {
    console.log("📊 Migration Status");
    console.log("=" .repeat(50));
    
    const appliedMigrations = await this.getAppliedMigrations();
    const availableMigrations = await this.getAvailableMigrations();
    
    console.log(`Applied migrations: ${appliedMigrations.length}`);
    console.log(`Available migrations: ${availableMigrations.length}`);
    
    if (appliedMigrations.length > 0) {
      console.log("\nApplied migrations:");
      appliedMigrations.forEach(version => {
        const migration = availableMigrations.find(m => m.version === version);
        console.log(`  ✓ ${version}: ${migration?.name || "Unknown"}`);
      });
    }
    
    const pendingMigrations = availableMigrations.filter(m => !appliedMigrations.includes(m.version));
    if (pendingMigrations.length > 0) {
      console.log("\nPending migrations:");
      pendingMigrations.forEach(migration => {
        console.log(`  ○ ${migration.version}: ${migration.name}`);
      });
    } else {
      console.log("\n✅ All migrations are up to date!");
    }
  }

  close() {
    this.db.close();
  }
}

async function main() {
  const command = process.argv[2];
  const targetVersion = process.argv[3] ? parseInt(process.argv[3]) : undefined;

  const manager = new MigrationManager();

  try {
    switch (command) {
      case "up":
        await manager.migrateUp(targetVersion);
        break;
      case "down":
        await manager.migrateDown(targetVersion);
        break;
      case "status":
        await manager.status();
        break;
      default:
        console.log("Usage: bun migration.ts [up|down|status] [version]");
        console.log("  up      - Apply pending migrations");
        console.log("  down    - Rollback migrations");
        console.log("  status  - Show migration status");
        console.log("  version - Optional target version number");
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    manager.close();
  }
}

if (import.meta.main) {
  main();
}