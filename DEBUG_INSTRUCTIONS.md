# Debug Instructions

## Issue 1: Club Name Not Showing

The club name should be displayed as "Organized by {club name}" but it's not appearing.

### Steps to Debug:

1. **Check the API response:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Navigate to Events page
   - Look for the request to `http://localhost:3001/api/events`
   - Check the Response tab
   - Verify if `club_name` field exists in the response

**Expected:**
```json
{
  "id": 123,
  "event_id": "EVT777950",
  "title": "test8",
  "club_id": 1,
  "club_name": "Cultural Club",  // <-- This should exist
  ...
}
```

**If `club_name` is null or missing:**
- The database JOIN might not be working
- Run this SQL query to check:
  ```sql
  SELECT e.*, cl.NAME as CLUB_NAME
  FROM EVENTS_1 e
  LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
  WHERE e.EVENT_ID = 'EVT777950';
  ```

## Issue 2: Double Booking Allowed

Events with the same venue, date, and time are being created.

### Test the Current Issue:

1. Try to create a new event:
   - Date: Oct 30, 2025
   - Time: 5:00 PM - 7:00 PM
   - Venue: Any venue that's already booked for this time

2. **Check the backend console output:**
   - You should see debug messages like:
     ```
     Checking for event overlaps: {
       venueId: 64,
       event_date: '2025-10-30',
       start_time: '17:00',
       end_time: '19:00'
     }
     Event overlap check result: {
       count: 1,  // <-- Should be 1 or more if there's an overlap
       rows: [...]
     }
     ```

3. **If count is 0 when it should be 1:**
   - The time format might not match
   - The SQL query parameters might be wrong
   - Check what's actually in the database:
     ```sql
     SELECT EVENT_ID, TITLE, VENUE_ID, EVENT_DATE, START_TIME, END_TIME
     FROM EVENTS_1
     WHERE VENUE_ID = 64
       AND TRUNC(EVENT_DATE) = TO_DATE('2025-10-30', 'YYYY-MM-DD');
     ```

## Quick Fix to Test

Try this in Oracle SQL:

```sql
-- Check what's in the EVENTS_1 table
SELECT e.EVENT_ID, e.TITLE, e.VENUE_ID, e.START_TIME, e.END_TIME, cl.NAME as CLUB_NAME
FROM EVENTS_1 e
LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
WHERE TRUNC(e.EVENT_DATE) = TO_DATE('2025-10-30', 'YYYY-MM-DD')
ORDER BY e.START_TIME;

-- Check for overlaps manually
SELECT e1.EVENT_ID as EVENT1, e2.EVENT_ID as EVENT2,
       e1.START_TIME, e1.END_TIME, e2.START_TIME, e2.END_TIME
FROM EVENTS_1 e1
JOIN EVENTS_1 e2 ON e1.VENUE_ID = e2.VENUE_ID 
  AND e1.ID < e2.ID
  AND TRUNC(e1.EVENT_DATE) = TRUNC(e2.EVENT_DATE)
  AND e1.START_TIME < e2.END_TIME
  AND e1.END_TIME > e2.START_TIME
WHERE TRUNC(e1.EVENT_DATE) = TO_DATE('2025-10-30', 'YYYY-MM-DD');
```

## Next Steps

Please check:
1. Browser DevTools Network tab for the `/api/events` response
2. Oracle API server console for the debug output when creating an event
3. Share the output so I can see what's happening

