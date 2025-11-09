# Database Migration System

This migration system uses Bun SQLite to manage database schema changes for the Football Manager Tauri application.

## Features

- **Up/Down Migrations**: Apply and rollback migrations with version control
- **Status Tracking**: Check which migrations are applied and pending
- **Version Targeting**: Migrate to specific versions
- **Migration Creation**: Easy creation of new migration files
- **SQLite Support**: Built specifically for Bun SQLite

## Usage

### Apply Migrations
```bash
# Apply all pending migrations
bun migration:up

# Apply migrations up to a specific version
bun migration:up 001
```

### Rollback Migrations
```bash
# Rollback the last applied migration
bun migration:down

# Rollback to a specific version
bun migration:down 001
```

### Check Migration Status
```bash
bun migration:status
```

### Create New Migration
```bash
# Create a new migration file
bun migration:create addUserRoles

# This creates: migrations/{timestamp}_add_user_roles.sql
```

## Migration File Format

Migration files follow this naming convention:
```
{number}_{context}.sql
```

Example: `001_initial_schema.sql`, `002_add_player_attributes.sql`

Each migration file must contain:
```sql
-- UP
-- Your up migration SQL here
CREATE TABLE users (...);

-- DOWN
-- Your down migration SQL here (rollback)
DROP TABLE IF EXISTS users;
```

## Database Location

- Database file: `/Users/afrianjunior/Workplace/experimental/football-manager/db/main.db`
- Migrations directory: `/Users/afrianjunior/Workplace/experimental/football-manager/migrations/`

## Migration Table

The system automatically creates a `migrations` table to track applied migrations:
```sql
CREATE TABLE migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Available Migrations

### 001_initial_schema.sql
- Creates core tables: players, screenshots, key_logs, teams, matches, player_stats
- Sets up basic indexes for performance

### 002_add_player_attributes.sql
- Adds detailed player attributes (height, weight, preferred_foot, etc.)
- Creates player_attributes table for skill ratings
- Adds team relationships

### 003_add_screenshot_analysis.sql
- Enhances screenshot analysis capabilities
- Adds AI analysis metadata columns
- Creates analysis_templates and screenshot_categories tables

## Best Practices

1. **Always test migrations** before committing
2. **Keep migrations atomic** - each migration should be self-contained
3. **Write reversible migrations** - ensure down migrations properly rollback changes
4. **Use transactions** for complex migrations (SQLite supports this automatically)
5. **Document your migrations** with clear comments
6. **Test rollback scenarios** to ensure data integrity

## Troubleshooting

### Migration Failed
- Check the error message in the console
- Ensure your SQL syntax is correct for SQLite
- Verify foreign key constraints are properly handled

### Database Locked
- Close any other connections to the database
- Ensure no other processes are accessing the database file

### Version Conflicts
- Check the migrations table for applied versions
- Use `bun migration:status` to see current state
- Manually fix version numbers if needed

## SQLite-Specific Notes

- SQLite has limited ALTER TABLE support (no DROP COLUMN)
- Foreign key constraints need to be enabled per connection
- Consider using PRAGMA statements for SQLite-specific configurations
- Use `IF EXISTS` clauses to make migrations idempotent