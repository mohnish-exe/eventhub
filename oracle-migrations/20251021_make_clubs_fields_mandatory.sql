-- Migration: Make all club fields mandatory (NOT NULL)
-- Date: 2025-10-21

-- Update existing NULL values first (if any) to avoid constraint violations
UPDATE clubs_1 
SET description = 'No description provided' 
WHERE description IS NULL;

UPDATE clubs_1 
SET coordinator_email = 'no-email@example.com' 
WHERE coordinator_email IS NULL;

UPDATE clubs_1 
SET coordinator_contact = '0000000000' 
WHERE coordinator_contact IS NULL;

-- Now alter the table to make columns NOT NULL
ALTER TABLE clubs_1 MODIFY (description CLOB NOT NULL);
ALTER TABLE clubs_1 MODIFY (coordinator_email VARCHAR2(255) NOT NULL);
ALTER TABLE clubs_1 MODIFY (coordinator_contact VARCHAR2(20) NOT NULL);

COMMIT;


