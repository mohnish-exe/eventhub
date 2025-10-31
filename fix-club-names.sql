-- Fix Club Names Issue
-- This script will help diagnose and fix the club name display problem

SET SERVEROUTPUT ON;
SET LINESIZE 200;

PROMPT ========================================
PROMPT Checking CLUBS_1 table:
PROMPT ========================================

SELECT ID, NAME FROM CLUBS_1 ORDER BY ID;

PROMPT ;
PROMPT ========================================
PROMPT Checking events with club_id:
PROMPT ========================================

SELECT 
    e.EVENT_ID,
    e.TITLE,
    e.CLUB_ID,
    cl.NAME as CLUB_NAME_FROM_JOIN
FROM EVENTS_1 e
LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
WHERE e.CLUB_ID IS NOT NULL
ORDER BY e.CLUB_ID;

PROMPT ;
PROMPT ========================================
PROMPT Diagnosis:
PROMPT ========================================
PROMPT If CLUB_NAME_FROM_JOIN is NULL, it means:
PROMPT 1. The club with that ID doesn't exist in CLUBS_1
PROMPT 2. There's a data type mismatch (unlikely)
PROMPT ;
PROMPT Solution: Update events to use existing club IDs
PROMPT or create the missing clubs in CLUBS_1 table
PROMPT ========================================

