# How to Run the Clubs Database Migration

## Quick Start

To make the club fields mandatory in your Oracle database, follow these steps:

### Option 1: Using SQL*Plus (Recommended)

1. Open a terminal/command prompt
2. Navigate to your project directory:
   ```bash
   cd C:\Users\mohnish\Downloads\eventhub-book-app-main
   ```

3. Connect to Oracle database:
   ```bash
   sqlplus system/your_password@localhost:1521/free
   ```

4. Run the migration script:
   ```sql
   @supabase/migrations/20251021_make_clubs_fields_mandatory.sql
   ```

### Option 2: Using SQL Developer

1. Open Oracle SQL Developer
2. Connect to your database
3. Open the migration file: `supabase/migrations/20251021_make_clubs_fields_mandatory.sql`
4. Click "Run Script" (F5)

### Option 3: Copy and Paste SQL

If you prefer to run the SQL manually, copy and paste this into your SQL client:

```sql
-- Update existing NULL values first
UPDATE clubs_1 
SET description = 'No description provided' 
WHERE description IS NULL;

UPDATE clubs_1 
SET coordinator_email = 'no-email@example.com' 
WHERE coordinator_email IS NULL;

UPDATE clubs_1 
SET coordinator_contact = '0000000000' 
WHERE coordinator_contact IS NULL;

-- Add NOT NULL constraints
ALTER TABLE clubs_1 MODIFY (description CLOB NOT NULL);
ALTER TABLE clubs_1 MODIFY (coordinator_email VARCHAR2(255) NOT NULL);
ALTER TABLE clubs_1 MODIFY (coordinator_contact VARCHAR2(20) NOT NULL);

COMMIT;
```

## Verification

After running the migration, verify it worked:

```sql
-- Check the table structure
DESC clubs_1;

-- You should see NOT NULL next to:
-- - DESCRIPTION
-- - COORDINATOR_EMAIL
-- - COORDINATOR_CONTACT
```

## Rollback (If Needed)

If you need to rollback the changes:

```sql
ALTER TABLE clubs_1 MODIFY (description CLOB NULL);
ALTER TABLE clubs_1 MODIFY (coordinator_email VARCHAR2(255) NULL);
ALTER TABLE clubs_1 MODIFY (coordinator_contact VARCHAR2(20) NULL);

COMMIT;
```

## What This Migration Does

1. **Updates existing NULL values** with placeholder data to avoid constraint violations
2. **Adds NOT NULL constraints** to ensure all future club entries have:
   - A description
   - Coordinator email
   - Coordinator contact

This aligns the database with the updated frontend form that now requires all these fields.

## Troubleshooting

### Error: "Cannot modify column to NOT NULL - NULL values exist"

This shouldn't happen because the migration updates NULL values first. If it does:

1. Check for NULL values:
   ```sql
   SELECT * FROM clubs_1 
   WHERE description IS NULL 
      OR coordinator_email IS NULL 
      OR coordinator_contact IS NULL;
   ```

2. Update them manually:
   ```sql
   UPDATE clubs_1 SET description = 'No description' WHERE description IS NULL;
   UPDATE clubs_1 SET coordinator_email = 'unknown@example.com' WHERE coordinator_email IS NULL;
   UPDATE clubs_1 SET coordinator_contact = '0000000000' WHERE coordinator_contact IS NULL;
   COMMIT;
   ```

3. Try the migration again

### Error: "Table or view does not exist"

Make sure you're connected to the correct database and schema where `clubs_1` table exists.

## Notes

- This migration is **safe to run multiple times** (it will only update NULL values that exist)
- Backup your database before running any migration in production
- The migration file is located at: `supabase/migrations/20251021_make_clubs_fields_mandatory.sql`


