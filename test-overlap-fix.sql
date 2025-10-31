-- Test Script: Verify Overlap Detection is Working
-- Run this to see what events exist and test the overlap logic

SET SERVEROUTPUT ON;
SET LINESIZE 200;

-- Show all events for Oct 30, 2025
PROMPT ========================================
PROMPT Events on October 30, 2025:
PROMPT ========================================
SELECT 
    e.EVENT_ID,
    e.TITLE,
    c.ROOM_NUMBER || ', ' || c.BUILDING as VENUE,
    TO_CHAR(e.EVENT_DATE, 'DD-MON-YYYY') as EVENT_DATE,
    e.START_TIME,
    e.END_TIME,
    e.STATUS
FROM EVENTS_1 e
LEFT JOIN CLASSROOMS_1 c ON e.VENUE_ID = c.ID
WHERE TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE('2025-10-30', 'YYYY-MM-DD'))
ORDER BY e.START_TIME;

PROMPT ;
PROMPT ========================================
PROMPT Test Overlap Detection:
PROMPT ========================================
PROMPT Testing if Room 505 (ID 64) is available on Oct 30, 5:00 PM - 7:00 PM
PROMPT ;

-- Test query: Should show 0 results if Room 505 is already booked for 5 PM - 7 PM on Oct 30
SELECT 
    COUNT(*) as OVERLAP_COUNT,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OVERLAP DETECTED - Room is BOOKED'
        ELSE 'NO OVERLAP - Room is AVAILABLE'
    END as RESULT
FROM EVENTS_1 e
WHERE e.VENUE_ID = 64
  AND TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE('2025-10-30', 'YYYY-MM-DD'))
  AND TO_TIMESTAMP('17:00', 'HH24:MI') < TO_TIMESTAMP(e.END_TIME, 'HH24:MI')
  AND TO_TIMESTAMP('19:00', 'HH24:MI') > TO_TIMESTAMP(e.START_TIME, 'HH24:MI');

PROMPT ;
PROMPT ========================================
PROMPT Test Extended Time Range:
PROMPT ========================================
PROMPT Testing if Room 505 (ID 64) is available on Oct 30, 12:00 PM - 9:00 PM
PROMPT ;

-- Test query: Should detect overlap if ANY event exists in this range
SELECT 
    COUNT(*) as OVERLAP_COUNT,
    CASE 
        WHEN COUNT(*) > 0 THEN 'OVERLAP DETECTED - Room is BOOKED'
        ELSE 'NO OVERLAP - Room is AVAILABLE'
    END as RESULT
FROM EVENTS_1 e
WHERE e.VENUE_ID = 64
  AND TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE('2025-10-30', 'YYYY-MM-DD'))
  AND TO_TIMESTAMP('12:00', 'HH24:MI') < TO_TIMESTAMP(e.END_TIME, 'HH24:MI')
  AND TO_TIMESTAMP('21:00', 'HH24:MI') > TO_TIMESTAMP(e.START_TIME, 'HH24:MI');

PROMPT ;
PROMPT ========================================
PROMPT Available Venues for Oct 30, 5:00 PM - 7:00 PM:
PROMPT ========================================

-- This query should NOT include Room 505 if it's already booked
SELECT 
    c.ROOM_NUMBER,
    c.BUILDING,
    c.CAPACITY
FROM CLASSROOMS_1 c
WHERE NOT EXISTS (
    SELECT 1 FROM CLASSROOM_BOOKINGS_1 cb
    WHERE cb.CLASSROOM_ID = c.ID
      AND TRUNC(cb.BOOKING_DATE) = TRUNC(TO_DATE('2025-10-30', 'YYYY-MM-DD'))
      AND TO_TIMESTAMP('17:00', 'HH24:MI') < TO_TIMESTAMP(cb.END_TIME, 'HH24:MI')
      AND TO_TIMESTAMP('19:00', 'HH24:MI') > TO_TIMESTAMP(cb.START_TIME, 'HH24:MI')
)
AND NOT EXISTS (
    SELECT 1 FROM EVENTS_1 e
    WHERE e.VENUE_ID = c.ID
      AND TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE('2025-10-30', 'YYYY-MM-DD'))
      AND TO_TIMESTAMP('17:00', 'HH24:MI') < TO_TIMESTAMP(e.END_TIME, 'HH24:MI')
      AND TO_TIMESTAMP('19:00', 'HH24:MI') > TO_TIMESTAMP(e.START_TIME, 'HH24:MI')
)
ORDER BY c.ROOM_NUMBER;

PROMPT ;
PROMPT ========================================
PROMPT Test Complete!
PROMPT ========================================

