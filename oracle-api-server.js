// Backend API Server for Oracle Database Operations
// This server runs separately and handles Oracle database connections

import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Oracle Database Configuration
const ORACLE_CONFIG = {
  user: 'system',
  password: 'root', // You'll need to enter your actual password
  connectString: 'localhost:1521/free', // Updated to match your "DBMS Project" connection
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  poolPingInterval: 60,
};

let pool = null;

// Initialize Oracle connection pool
async function initializeOraclePool() {
  try {
    console.log('Connecting to Oracle database...');
    console.log('Connection details:', {
      user: ORACLE_CONFIG.user,
      connectString: ORACLE_CONFIG.connectString
    });

    pool = await oracledb.createPool(ORACLE_CONFIG);
    console.log('✅ Oracle database connection pool created successfully!');
    
    // Test the connection
    const connection = await pool.getConnection();
    const result = await connection.execute('SELECT 1 as test FROM dual');
    await connection.close();
    console.log('✅ Oracle database test query successful:', result.rows[0]);
  } catch (error) {
    console.error('❌ Failed to connect to Oracle database:', error);
    console.log('💡 Oracle database connection failed. Using fallback mode.');
    console.log('💡 To connect to Oracle database:');
    console.log('   1. Make sure Oracle database is running');
    console.log('   2. Check your "DBMS project" connection details');
    console.log('   3. Update the connectString in oracle-api-server.js');
    console.log('   4. Run oracle-schema.sql to create tables');
    console.log('💡 For now, the app will work with localStorage persistence.');
    
    // Set pool to null to indicate fallback mode
    pool = null;
  }
}

// Helper function to execute queries
async function executeQuery(sql, binds = []) {
  if (!pool) {
    console.log('⚠️ Oracle database not connected, returning empty result');
    return [];
  }
  
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      fetchInfo: {
        FACILITIES: { type: oracledb.STRING },
        DESCRIPTION: { type: oracledb.STRING }
      }
    });
    
    // Clean up the result to avoid circular references
    const cleanRows = (result.rows || []).map(row => {
      const cleanRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined) {
          cleanRow[key] = value;
        } else if (value instanceof Date) {
          cleanRow[key] = value.toISOString();
        } else if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'Lob') {
          cleanRow[key] = value.toString();
        } else if (typeof value === 'object' && value.constructor && value.constructor.name.includes('Connect')) {
          // Skip Oracle connection objects
          cleanRow[key] = null;
        } else if (typeof value === 'object') {
          // For other objects, try to convert to string or skip
          try {
            JSON.stringify(value);
            cleanRow[key] = value;
          } catch (e) {
            cleanRow[key] = value.toString();
          }
        } else {
          cleanRow[key] = value;
        }
      }
      return cleanRow;
    });
    
    return cleanRows;
  } finally {
    await connection.close();
  }
}

// Helper: check if a column exists on a table (uppercase names)
async function columnExists(tableName, columnName) {
  try {
    const rows = await executeQuery(
      `SELECT COUNT(1) AS CNT FROM ALL_TAB_COLUMNS WHERE UPPER(TABLE_NAME)=:1 AND UPPER(COLUMN_NAME)=:2`,
      [String(tableName).toUpperCase(), String(columnName).toUpperCase()]
    );
    const cnt = rows && rows[0] ? Number(rows[0].CNT) : 0;
    return cnt > 0;
  } catch {
    return false;
  }
}

// Helper function to execute insert/update/delete
async function executeDML(sql, binds = []) {
  if (!pool) {
    console.log('⚠️ Oracle database not connected, simulating operation');
    return { rowsAffected: 1 };
  }
  
  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(sql, binds, {
      autoCommit: true
    });
    return result;
  } finally {
    await connection.close();
  }
}

// API Routes

// Classrooms endpoints
app.get('/api/classrooms', async (req, res) => {
  try {
    const classrooms = await executeQuery('SELECT * FROM CLASSROOMS_1 ORDER BY room_number');
    
    // Transform Oracle field names to match frontend interface
    const transformedClassrooms = classrooms.map(classroom => ({
      id: classroom.ID,
      room_number: classroom.ROOM_NUMBER,
      building: classroom.BUILDING,
      capacity: classroom.CAPACITY,
      facilities: classroom.FACILITIES,
      created_at: classroom.CREATED_AT
    }));
    
    res.json(transformedClassrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
});

// Get available classrooms for a specific date and time
app.get('/api/classrooms/available', async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, startTime, and endTime are required' });
    }

    // Exclude classrooms with overlapping bookings on the selected date/time
    // Normalize times to 24-hour HH:MI
    const to24h = (t) => {
      if (!t) return t;
      const str = String(t).trim();
      if (/am|pm/i.test(str)) {
        const up = str.toUpperCase();
        // Expect formats like "05:00 PM" or "5:00 PM"
        const d = new Date(`1970-01-01 ${up}`);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      return str; // already HH:MM
    };

    const start24 = to24h(startTime);
    const end24 = to24h(endTime);
    const toNum = (hhmm) => Number(String(hhmm).replace(':',''));
    const startNum = toNum(start24);
    const endNum = toNum(end24);

    console.log('Debug venue availability:', { date, startTime, endTime, start24, end24, startNum, endNum });

    // Time overlap occurs when: (new_start < existing_end) AND (new_end > existing_start)
    // So we exclude classrooms where there IS an overlap
    const sql = `
      SELECT c.*
      FROM CLASSROOMS_1 c
      WHERE NOT EXISTS (
        SELECT 1 FROM CLASSROOM_BOOKINGS_1 cb
        WHERE cb.CLASSROOM_ID = c.ID
          AND TRUNC(cb.BOOKING_DATE) = TRUNC(TO_DATE(:1, 'YYYY-MM-DD'))
          AND TO_TIMESTAMP(:2, 'HH24:MI') < TO_TIMESTAMP(cb.END_TIME, 'HH24:MI')
          AND TO_TIMESTAMP(:3, 'HH24:MI') > TO_TIMESTAMP(cb.START_TIME, 'HH24:MI')
      )
      AND NOT EXISTS (
        SELECT 1 FROM EVENTS_1 e
        WHERE e.VENUE_ID = c.ID
          AND TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE(:4, 'YYYY-MM-DD'))
          AND TO_TIMESTAMP(:5, 'HH24:MI') < TO_TIMESTAMP(e.END_TIME, 'HH24:MI')
          AND TO_TIMESTAMP(:6, 'HH24:MI') > TO_TIMESTAMP(e.START_TIME, 'HH24:MI')
      )
      ORDER BY c.ROOM_NUMBER`;
    
    const availableClassrooms = await executeQuery(sql, [date, start24, end24, date, start24, end24]);
    
    // Transform Oracle field names to match frontend interface
    const transformedClassrooms = availableClassrooms.map(classroom => ({
      id: classroom.ID,
      room_number: classroom.ROOM_NUMBER,
      building: classroom.BUILDING,
      capacity: classroom.CAPACITY,
      facilities: classroom.FACILITIES,
      created_at: classroom.CREATED_AT
    }));
    
    res.json(transformedClassrooms);
  } catch (error) {
    console.error('Error fetching available classrooms:', error);
    res.status(500).json({ error: 'Failed to fetch available classrooms' });
  }
});

app.post('/api/classrooms', async (req, res) => {
  try {
    const { room_number, building, capacity, facilities } = req.body;
    const sql = `INSERT INTO CLASSROOMS_1 (room_number, building, capacity, facilities) VALUES (:1, :2, :3, :4)`;
    await executeDML(sql, [room_number, building, capacity, facilities]);
    res.json({ success: true, message: 'Classroom created successfully' });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

// Delete classroom endpoint (also remove dependent bookings)
app.delete('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Null out venue references in events to satisfy FKs
    await executeDML('UPDATE EVENTS_1 SET venue_id = NULL WHERE venue_id = :1', [id]);
    // Delete dependent bookings first to avoid FK errors
    await executeDML('DELETE FROM CLASSROOM_BOOKINGS_1 WHERE classroom_id = :1', [id]);
    await executeDML('DELETE FROM CLASSROOMS_1 WHERE id = :1', [id]);
    res.json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
});

// Clubs endpoints
app.get('/api/clubs', async (req, res) => {
  try {
    const clubs = await executeQuery('SELECT * FROM CLUBS_1 ORDER BY name');
    
    // Transform Oracle field names to match frontend interface
    const transformedClubs = clubs.map(club => ({
      id: club.ID,
      name: club.NAME,
      description: club.DESCRIPTION,
      coordinator_email: club.COORDINATOR_EMAIL,
      coordinator_contact: club.COORDINATOR_CONTACT,
      created_at: club.CREATED_AT
    }));
    
    res.json(transformedClubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

app.post('/api/clubs', async (req, res) => {
  try {
    const { name, description, coordinator_email, coordinator_contact } = req.body;
    const sql = `INSERT INTO CLUBS_1 (name, description, coordinator_email, coordinator_contact) VALUES (:1, :2, :3, :4)`;
    await executeDML(sql, [name, description, coordinator_email, coordinator_contact]);
    res.json({ success: true, message: 'Club created successfully' });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

app.delete('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // First, set club_id to NULL in events that reference this club to avoid FK errors
    await executeDML('UPDATE EVENTS_1 SET club_id = NULL WHERE club_id = :1', [id]);
    // Now delete the club
    await executeDML('DELETE FROM CLUBS_1 WHERE id = :1', [id]);
    res.json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ error: 'Failed to delete club' });
  }
});

// Events endpoints
app.get('/api/events', async (req, res) => {
  try {
    const events = await executeQuery(`
      SELECT e.ID, e.EVENT_ID, e.TITLE, e.CLUB_ID, e.ORGANIZER_NAME, e.DESCRIPTION, 
             e.EVENT_DATE, e.START_TIME, e.END_TIME, e.VENUE_ID, e.CATEGORY, 
             e.MAX_PARTICIPANTS, e.ENTRY_FEES, e.STATUS, e.CREATED_BY, e.CREATED_AT, e.UPDATED_AT,
             c.ROOM_NUMBER, c.BUILDING, c.CAPACITY, 
             cl.NAME as CLUB_NAME
      FROM EVENTS_1 e
      LEFT JOIN CLASSROOMS_1 c ON e.VENUE_ID = c.ID
      LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
      ORDER BY e.EVENT_DATE DESC
    `);
    
    console.log('Raw event data sample:', events.length > 0 ? {
      CLUB_ID: events[0].CLUB_ID,
      CLUB_NAME: events[0].CLUB_NAME,
      TITLE: events[0].TITLE
    } : 'No events');
    
    // Transform Oracle field names to match frontend interface
    const transformedEvents = events.map(event => {
      // Parse organizer_name back into faculty_coordinator and student_coordinator
      let faculty_coordinator = '';
      let student_coordinator = '';
      
      if (event.ORGANIZER_NAME && event.ORGANIZER_NAME.includes(' & ')) {
        const [faculty, student] = event.ORGANIZER_NAME.split(' & ');
        faculty_coordinator = faculty?.trim() || '';
        student_coordinator = student?.trim() || '';
      } else if (event.ORGANIZER_NAME) {
        // Fallback if format is different
        faculty_coordinator = event.ORGANIZER_NAME;
        student_coordinator = '';
      }
      
      const transformed = {
        id: event.ID,
        event_id: event.EVENT_ID,
        title: event.TITLE,
        club_id: event.CLUB_ID,
        club_name: event.CLUB_NAME,
        organizer_name: event.ORGANIZER_NAME,
        faculty_coordinator: faculty_coordinator,
        student_coordinator: student_coordinator,
        description: event.DESCRIPTION,
        event_date: event.EVENT_DATE,
        start_time: event.START_TIME,
        end_time: event.END_TIME,
        venue_id: event.VENUE_ID,
        category: event.CATEGORY,
        max_participants: event.MAX_PARTICIPANTS,
        entry_fees: event.ENTRY_FEES,
        status: event.STATUS,
        created_by: event.CREATED_BY,
        created_at: event.CREATED_AT,
        updated_at: event.UPDATED_AT,
        classrooms: event.ROOM_NUMBER ? {
          room_number: event.ROOM_NUMBER,
          building: event.BUILDING,
          capacity: event.CAPACITY
        } : null
      };
      
      console.log('Transformed event:', {
        title: transformed.title,
        club_id: transformed.club_id,
        club_name: transformed.club_name
      });
      
      return transformed;
    });
    
    res.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Events by date (for classroom view) - fetch events on a specific date with classroom info
app.get('/api/events/by-date', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    }

    const rows = await executeQuery(`
      SELECT e.ID, e.EVENT_ID, e.TITLE, e.CLUB_ID, cl.NAME as CLUB_NAME, e.EVENT_DATE, e.START_TIME, e.END_TIME,
             c.ID as CLASSROOM_ID, c.ROOM_NUMBER, c.BUILDING, c.CAPACITY
      FROM EVENTS_1 e
      LEFT JOIN CLASSROOMS_1 c ON e.VENUE_ID = c.ID
      LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
      WHERE TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE(:1, 'YYYY-MM-DD'))
      ORDER BY c.BUILDING, c.ROOM_NUMBER, e.START_TIME
    `, [date]);

    const data = rows.map(r => ({
      id: r.ID,
      event_id: r.EVENT_ID,
      title: r.TITLE,
      club_name: r.CLUB_NAME,
      event_date: r.EVENT_DATE,
      start_time: r.START_TIME,
      end_time: r.END_TIME,
      classrooms: r.ROOM_NUMBER ? {
        id: r.CLASSROOM_ID,
        room_number: r.ROOM_NUMBER,
        building: r.BUILDING,
        capacity: r.CAPACITY,
      } : null
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching events by date:', error);
    res.status(500).json({ error: 'Failed to fetch events by date' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { event_id, title, club_id, faculty_coordinator, student_coordinator, description, event_date, start_time, end_time, venue_id, category, max_participants, entry_fees, status, created_by } = req.body;
    
    console.log('Creating event with data:', { event_id, title, club_id, venue_id, faculty_coordinator, student_coordinator });
    
    // Handle null values properly for Oracle
    const organizerName = `${faculty_coordinator} & ${student_coordinator}`;
    const eventDate = event_date ? new Date(event_date) : null;
    const venueId = venue_id === '' || venue_id === undefined ? null : venue_id;
    const clubId = club_id === '' || club_id === undefined ? null : club_id;
    const maxParticipants = max_participants === '' || max_participants === undefined ? null : max_participants;
    const createdBy = created_by || null;
    
    console.log('Processed values:', { organizerName, eventDate, venueId, clubId, maxParticipants, createdBy });
    
    // Enforce venue is mandatory
    if (!venueId) {
      return res.status(400).json({ error: 'venue_id is required' });
    }

    // If venue provided, enforce max_participants <= classroom capacity
    if (venueId && maxParticipants) {
      const capRows = await executeQuery('SELECT CAPACITY FROM CLASSROOMS_1 WHERE ID = :1', [venueId]);
      const capacity = capRows && capRows[0] ? Number(capRows[0].CAPACITY) : null;
      if (capacity !== null && maxParticipants > capacity) {
        return res.status(400).json({ error: `max_participants (${maxParticipants}) exceeds venue capacity (${capacity})` });
      }
    }

    // Validate no overlap exists at booking time (race safety)
    // Check classroom bookings table
    // Time overlap occurs when: (new_start < existing_end) AND (new_end > existing_start)
    const overlapRows = await executeQuery(`
      SELECT COUNT(1) AS CNT
      FROM CLASSROOM_BOOKINGS_1 cb
      WHERE cb.CLASSROOM_ID = :1
        AND TRUNC(cb.BOOKING_DATE) = TRUNC(TO_DATE(:2, 'YYYY-MM-DD'))
        AND TO_TIMESTAMP(:3, 'HH24:MI') < TO_TIMESTAMP(cb.END_TIME, 'HH24:MI')
        AND TO_TIMESTAMP(:4, 'HH24:MI') > TO_TIMESTAMP(cb.START_TIME, 'HH24:MI')
    `, [venueId, event_date, start_time, end_time]);
    const overlapCount = overlapRows && overlapRows[0] ? Number(overlapRows[0].CNT) : 0;
    if (overlapCount > 0) {
      return res.status(409).json({ error: 'Selected venue is already booked for the given date/time in classroom bookings' });
    }

    // Also check events table for existing events at this venue
    console.log('Checking for event overlaps:', {
      venueId,
      event_date,
      start_time,
      end_time
    });
    
    // First, let's see what events exist at this venue/date
    const existingEvents = await executeQuery(`
      SELECT EVENT_ID, TITLE, START_TIME, END_TIME, TO_CHAR(EVENT_DATE, 'YYYY-MM-DD') as EVENT_DATE_STR
      FROM EVENTS_1 e
      WHERE e.VENUE_ID = :1
        AND TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE(:2, 'YYYY-MM-DD'))
    `, [venueId, event_date]);
    
    console.log('Existing events at this venue/date:', existingEvents);
    
    // Convert times to timestamps for proper comparison
    // Time overlap occurs when: (new_start < existing_end) AND (new_end > existing_start)
    const eventOverlapRows = await executeQuery(`
      SELECT COUNT(1) AS CNT
      FROM EVENTS_1 e
      WHERE e.VENUE_ID = :1
        AND TRUNC(e.EVENT_DATE) = TRUNC(TO_DATE(:2, 'YYYY-MM-DD'))
        AND TO_TIMESTAMP(:3, 'HH24:MI') < TO_TIMESTAMP(e.END_TIME, 'HH24:MI')
        AND TO_TIMESTAMP(:4, 'HH24:MI') > TO_TIMESTAMP(e.START_TIME, 'HH24:MI')
    `, [venueId, event_date, start_time, end_time]);
    const eventOverlapCount = eventOverlapRows && eventOverlapRows[0] ? Number(eventOverlapRows[0].CNT) : 0;
    
    console.log('Event overlap check result:', {
      count: eventOverlapCount,
      rows: eventOverlapRows,
      query_params: [venueId, event_date, start_time, end_time],
      sql_explanation: 'Checking if new_start < existing_end AND new_end > existing_start'
    });
    
    if (eventOverlapCount > 0) {
      return res.status(409).json({ error: 'Selected venue is already booked for the given date/time by another event' });
    }

    // Insert event with club_id
    const sql = `INSERT INTO EVENTS_1 (event_id, title, club_id, organizer_name, description, event_date, start_time, end_time, venue_id, category, max_participants, entry_fees, status, created_by) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14)`;
    await executeDML(sql, [event_id, title, clubId, organizerName, description, eventDate, start_time, end_time, venueId, category, maxParticipants, entry_fees, status, createdBy]);
    
    console.log('✅ Event inserted with club_id:', clubId);
    
    // Verify what was actually saved
    const verifyRows = await executeQuery(`
      SELECT e.EVENT_ID, e.TITLE, e.CLUB_ID, cl.NAME as CLUB_NAME
      FROM EVENTS_1 e
      LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
      WHERE e.EVENT_ID = :1
    `, [event_id]);
    
    console.log('Verification - What was saved in database:', verifyRows[0]);

    // Also create a classroom booking when a venue is selected
    try {
      if (venueId) {
        // Get the newly created event's internal ID
        const rows = await executeQuery('SELECT ID FROM EVENTS_1 WHERE EVENT_ID = :1', [event_id]);
        const newEventId = rows && rows[0] ? rows[0].ID : null;
        if (newEventId) {
          await executeDML(
            `INSERT INTO CLASSROOM_BOOKINGS_1 (classroom_id, event_id, booking_date, start_time, end_time, status, booked_by)
             VALUES (:1, :2, :3, :4, :5, :6, :7)`,
            [venueId, newEventId, eventDate, start_time, end_time, 'pending', createdBy]
          );
        }
      }
    } catch (bookingErr) {
      console.error('Warning: event created but failed to create booking:', bookingErr);
      // Do not fail the whole request, event is already created
    }

    res.json({ success: true, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Delete event endpoint
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM EVENTS_1 WHERE id = :1`;
    await executeDML(sql, [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Classroom bookings endpoints
app.get('/api/classroom-bookings', async (req, res) => {
  try {
    const { date } = req.query;
    let sql = `
      SELECT cb.ID as CB_ID, cb.CLASSROOM_ID, cb.BOOKING_DATE, cb.START_TIME as CB_START_TIME, cb.END_TIME as CB_END_TIME,
             e.ID as E_ID, e.TITLE as E_TITLE, e.CLUB_ID as E_CLUB_ID, cl.NAME as E_CLUB_NAME, e.START_TIME as E_START_TIME, e.END_TIME as E_END_TIME,
             c.ID as C_ID, c.ROOM_NUMBER as C_ROOM_NUMBER, c.BUILDING as C_BUILDING, c.CAPACITY as C_CAPACITY
      FROM CLASSROOM_BOOKINGS_1 cb
      LEFT JOIN EVENTS_1 e ON cb.EVENT_ID = e.ID
      LEFT JOIN CLUBS_1 cl ON e.CLUB_ID = cl.ID
      LEFT JOIN CLASSROOMS_1 c ON cb.CLASSROOM_ID = c.ID`;
    const binds = [];
    if (date) {
      sql += ` WHERE TRUNC(cb.BOOKING_DATE) = TRUNC(TO_DATE(:1, 'YYYY-MM-DD'))`;
      binds.push(date);
    }
    sql += ` ORDER BY c.BUILDING, c.ROOM_NUMBER, cb.START_TIME`;

    const rows = await executeQuery(sql, binds);

    const transformed = rows.map(r => ({
      id: r.CB_ID,
      classroom_id: r.CLASSROOM_ID,
      booking_date: r.BOOKING_DATE,
      start_time: r.CB_START_TIME,
      end_time: r.CB_END_TIME,
      events: r.E_ID ? {
        id: r.E_ID,
        title: r.E_TITLE,
        club_name: r.E_CLUB_NAME,
        start_time: r.E_START_TIME,
        end_time: r.E_END_TIME,
      } : null,
      classrooms: {
        id: r.C_ID,
        room_number: r.C_ROOM_NUMBER,
        building: r.C_BUILDING,
        capacity: r.C_CAPACITY,
      }
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching classroom bookings:', error);
    res.status(500).json({ error: 'Failed to fetch classroom bookings' });
  }
});

// Delete classroom booking
app.delete('/api/classroom-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the event_id associated with this booking
    const bookingRows = await executeQuery('SELECT EVENT_ID FROM CLASSROOM_BOOKINGS_1 WHERE ID = :1', [id]);
    const eventId = bookingRows && bookingRows[0] ? bookingRows[0].EVENT_ID : null;
    
    console.log(`Deleting booking ${id}, associated event_id: ${eventId}`);
    
    // Delete the classroom booking
    await executeDML('DELETE FROM CLASSROOM_BOOKINGS_1 WHERE id = :1', [id]);
    
    // If there's an associated event, delete it too
    if (eventId) {
      console.log(`Also deleting event ${eventId}`);
      await executeDML('DELETE FROM EVENTS_1 WHERE ID = :1', [eventId]);
    }
    
    res.json({ success: true, message: 'Booking and associated event deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom booking:', error);
    res.status(500).json({ error: 'Failed to delete classroom booking' });
  }
});

app.post('/api/classroom-bookings', async (req, res) => {
  try {
    const { classroom_id, event_id, booking_date, start_time, end_time, status, booked_by } = req.body;
    const sql = `INSERT INTO CLASSROOM_BOOKINGS_1 (classroom_id, event_id, booking_date, start_time, end_time, status, booked_by) VALUES (:1, :2, :3, :4, :5, :6, :7)`;
    await executeDML(sql, [classroom_id, event_id, booking_date, start_time, end_time, status, booked_by]);
    res.json({ success: true, message: 'Classroom booking created successfully' });
  } catch (error) {
    console.error('Error creating classroom booking:', error);
    res.status(500).json({ error: 'Failed to create classroom booking' });
  }
});

// Backfill bookings from events when bookings table is empty
app.post('/api/classroom-bookings/migrate', async (req, res) => {
  try {
    // Check if bookings table is empty
    const countRows = await executeQuery('SELECT COUNT(*) as CNT FROM CLASSROOM_BOOKINGS_1');
    const currentCount = countRows && countRows[0] ? Number(countRows[0].CNT) : 0;

    if (currentCount > 0) {
      return res.json({ success: true, message: 'Bookings table already has data', currentCount });
    }

    // Insert from events where venue is set
    const insertResult = await executeDML(`
      INSERT INTO CLASSROOM_BOOKINGS_1 (
        classroom_id, event_id, booking_date, start_time, end_time, status, booked_by, created_at
      )
      SELECT 
        e.VENUE_ID as classroom_id,
        e.ID as event_id,
        e.EVENT_DATE as booking_date,
        e.START_TIME as start_time,
        e.END_TIME as end_time,
        CASE 
          WHEN e.STATUS = 'rejected' THEN 'rejected'
          WHEN e.STATUS IN ('faculty_approved','hod_approved','approved') THEN 'approved'
          ELSE 'pending'
        END as status,
        e.CREATED_BY as booked_by,
        NVL(e.CREATED_AT, SYSTIMESTAMP) as created_at
      FROM EVENTS_1 e
      WHERE e.VENUE_ID IS NOT NULL
    `);

    // Return inserted count if available
    res.json({ success: true, message: 'Bookings backfilled from events', inserted: insertResult.rowsAffected || null });
  } catch (error) {
    console.error('Error migrating classroom bookings from events:', error);
    res.status(500).json({ error: 'Failed to migrate classroom bookings from events' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Oracle API server is running' });
});

// Start server
async function startServer() {
  await initializeOraclePool();
  
  app.listen(PORT, () => {
    console.log(`🚀 Oracle API server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   GET    /api/classrooms`);
    console.log(`   POST   /api/classrooms`);
    console.log(`   DELETE /api/classrooms/:id`);
    console.log(`   GET    /api/clubs`);
    console.log(`   POST   /api/clubs`);
    console.log(`   DELETE /api/clubs/:id`);
    console.log(`   GET    /api/events`);
    console.log(`   POST   /api/events`);
    console.log(`   DELETE /api/events/:id`);
    console.log(`   GET    /api/classroom-bookings`);
    console.log(`   POST   /api/classroom-bookings`);
    console.log(`   DELETE /api/classroom-bookings/:id`);
    console.log(`   GET    /api/health`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Oracle API server...');
  if (pool) {
    await pool.close();
    console.log('✅ Oracle connection pool closed');
  }
  process.exit(0);
});

startServer().catch(console.error);
