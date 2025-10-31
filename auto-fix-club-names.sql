-- AUTOMATIC FIX: Update Events to Use Valid Club IDs
-- This script will fix all events to reference existing clubs

SET SERVEROUTPUT ON;

PROMPT ========================================
PROMPT AUTO-FIX: Updating Event Club IDs
PROMPT ========================================
PROMPT ;

-- First, show which clubs exist
PROMPT Current clubs in database:
PROMPT ----------------------------------------
SELECT ID, NAME FROM CLUBS_1 ORDER BY ID;

PROMPT ;
PROMPT ========================================
PROMPT Fixing events with invalid club_id...
PROMPT ========================================

-- Get the first valid club ID
DECLARE
    v_first_club_id NUMBER;
    v_club_name VARCHAR2(255);
    v_updated_count NUMBER := 0;
BEGIN
    -- Get first club
    SELECT ID, NAME INTO v_first_club_id, v_club_name
    FROM CLUBS_1
    WHERE ROWNUM = 1;
    
    DBMS_OUTPUT.PUT_LINE('Using club: ' || v_club_name || ' (ID: ' || v_first_club_id || ')');
    
    -- Update events with invalid club_id to use the first valid club
    UPDATE EVENTS_1
    SET CLUB_ID = v_first_club_id
    WHERE CLUB_ID IS NULL 
       OR CLUB_ID NOT IN (SELECT ID FROM CLUBS_1);
    
    v_updated_count := SQL%ROWCOUNT;
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Updated ' || v_updated_count || ' events');
    DBMS_OUTPUT.PUT_LINE('✅ Fix complete!');
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('❌ ERROR: No clubs found in CLUBS_1 table!');
        DBMS_OUTPUT.PUT_LINE('Please create at least one club first.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('❌ ERROR: ' || SQLERRM);
        ROLLBACK;
END;
/

PROMPT ;
PROMPT ========================================
PROMPT Verification:
PROMPT ========================================

SELECT 
    e.EVENT_ID,
    e.TITLE,
    e.CLUB_ID,
    cl.NAME as CLUB_NAME
FROM EVENTS_1 e
LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
WHERE ROWNUM <= 10
ORDER BY e.EVENT_ID DESC;

PROMPT ;
PROMPT ========================================
PROMPT All events should now have valid club names!
PROMPT Refresh your browser to see the changes.
PROMPT ========================================

