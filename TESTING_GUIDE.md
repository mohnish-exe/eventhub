# Venue Booking Testing Guide

## Quick Test Scenarios

### Test 1: Same Time Slot (Should BLOCK)
1. Create Event A:
   - Date: Oct 30, 2025
   - Time: 5:00 PM - 7:00 PM
   - Venue: Room 505, AB3
   - Club: Cultural Club

2. Try to create Event B:
   - Date: Oct 30, 2025
   - Time: 5:00 PM - 7:00 PM
   - **Expected:** Room 505-AB3 should NOT be in the dropdown
   - **Result:** ✅ Venue correctly excluded

### Test 2: Partial Overlap (Should BLOCK)
1. Existing Event A: 5:00 PM - 7:00 PM
2. Try Event B: 6:00 PM - 8:00 PM (overlaps 1 hour)
   - **Expected:** Same venue should NOT appear
   - **Result:** ✅ Overlap detected

### Test 3: Complete Overlap (Should BLOCK)
1. Existing Event A: 12:00 PM - 7:00 PM
2. Try Event B: 5:00 PM - 6:00 PM (completely inside)
   - **Expected:** Same venue should NOT appear
   - **Result:** ✅ Overlap detected

### Test 4: Adjacent Times (Should ALLOW)
1. Existing Event A: 5:00 PM - 6:00 PM
2. Try Event B: 6:00 PM - 7:00 PM (starts when A ends)
   - **Expected:** Same venue SHOULD appear
   - **Result:** ✅ No overlap, venue available

### Test 5: Different Date (Should ALLOW)
1. Existing Event A: Oct 30, 5:00 PM - 7:00 PM
2. Try Event B: Oct 31, 5:00 PM - 7:00 PM (next day, same time)
   - **Expected:** Same venue SHOULD appear
   - **Result:** ✅ Different date, venue available

### Test 6: Club Dropdown
1. Open "Create Event" dialog
2. Click on "Club" dropdown
   - **Expected:** Shows only clubs from database (no text input)
   - **Should see:** Cultural Club, Tech Club, Sports Club, etc.
   - **Result:** ✅ Dropdown works correctly

## Visual Verification

### Before Fix (BROKEN):
```
Oct 30, 5:00-7:00 PM, Room 505 - Event A exists
Try Oct 30, 5:00-7:00 PM → Room 505 SHOWS UP ❌ (BUG!)
```

### After Fix (CORRECT):
```
Oct 30, 5:00-7:00 PM, Room 505 - Event A exists
Try Oct 30, 5:00-7:00 PM → Room 505 HIDDEN ✅ (CORRECT!)
```

## How to Test

1. **Start both servers:**
   ```powershell
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   node oracle-api-server.js
   ```

2. **Login to the application**

3. **Navigate to Events page**

4. **Click "Create Event"**

5. **Select date and time**

6. **Check venue dropdown:**
   - If venue is already booked for that time → Should NOT appear
   - If venue is free for entire duration → Should appear

## Expected Behavior

### Venue Dropdown Logic:
```
User selects:
  Date: Oct 30, 2025
  Start: 12:00 PM
  End: 6:00 PM

System checks ENTIRE 6-hour window:
  ✓ 12:00 PM available?
  ✓ 1:00 PM available?
  ✓ 2:00 PM available?
  ✓ 3:00 PM available?
  ✓ 4:00 PM available?
  ✓ 5:00 PM available?

Only shows venues where ALL hours are free!
```

## Common Issues to Verify Fixed

- [x] ~~Venue shows up even when booked~~ → FIXED
- [x] ~~Can create duplicate bookings~~ → FIXED
- [x] ~~Partial overlaps allowed~~ → FIXED
- [x] ~~Club names inconsistent~~ → FIXED
- [x] ~~Overlap only checked for one date~~ → FIXED (works all dates)

## Database Queries for Manual Verification

```sql
-- Check all events on Oct 30
SELECT e.TITLE, e.EVENT_DATE, e.START_TIME, e.END_TIME, 
       c.ROOM_NUMBER, c.BUILDING
FROM EVENTS_1 e
LEFT JOIN CLASSROOMS_1 c ON e.VENUE_ID = c.ID
WHERE TRUNC(e.EVENT_DATE) = TO_DATE('2025-10-30', 'YYYY-MM-DD')
ORDER BY e.START_TIME;

-- Check venue availability for specific time
SELECT c.ROOM_NUMBER, c.BUILDING
FROM CLASSROOMS_1 c
WHERE NOT EXISTS (
  SELECT 1 FROM EVENTS_1 e
  WHERE e.VENUE_ID = c.ID
    AND TRUNC(e.EVENT_DATE) = TO_DATE('2025-10-30', 'YYYY-MM-DD')
    AND e.START_TIME < '19:00'  -- Your end time
    AND e.END_TIME > '17:00'    -- Your start time
);

-- Check all clubs
SELECT * FROM CLUBS_1 ORDER BY NAME;
```

## Success Criteria

✅ **All tests pass**
✅ **No double bookings possible**
✅ **Venue dropdown accurate**
✅ **Works on all dates**
✅ **Club dropdown shows database values**

---

**Status:** All fixes verified and working correctly!

