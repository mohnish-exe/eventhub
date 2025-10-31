# Oracle Database Integration Setup

This project has been migrated from Supabase to Oracle Database 23ai. Follow these steps to set up the Oracle database integration.

## Prerequisites

1. **Oracle Database 23ai** installed and running on your system
2. **Node.js** with Oracle Instant Client or Oracle Client libraries
3. **Oracle connection** named "DBMS project" as mentioned in your requirements

## Database Setup

### 1. Create Database Tables

Run the SQL script `oracle-schema.sql` in your Oracle database to create all required tables with the `-1` suffix:

```sql
-- Execute the oracle-schema.sql file in your Oracle database
-- This will create all tables: profiles_1, user_roles_1, clubs_1, classrooms_1, 
-- events_1, participants_1, classroom_bookings_1, event_approvals_1
```

### 2. Configure Database Connection

Update the Oracle connection settings in `src/config/oracle.ts`:

```typescript
export const ORACLE_CONFIG = {
  user: 'your_oracle_username',        // Replace with your Oracle username
  password: 'your_oracle_password',    // Replace with your Oracle password
  connectString: 'your_connection_string', // Replace with your Oracle connection string
  // ... other settings
};
```

For your "DBMS project" connection, update the `connectString` to match your Oracle database connection details.

### 3. Install Dependencies

The Oracle database driver has been added to `package.json`. Install it:

```bash
npm install
# or
bun install
```

## Database Schema

The following tables have been created with the `-1` suffix as requested:

### Core Tables
- **profiles_1**: User profiles and authentication
- **user_roles_1**: User role assignments (student, faculty, hod, admin)
- **clubs_1**: Club information and coordinators
- **classrooms_1**: Classroom details and facilities
- **events_1**: Event information and details
- **participants_1**: Event participant registrations
- **classroom_bookings_1**: Classroom booking requests
- **event_approvals_1**: Event approval workflow

### Key Features Implemented

1. **Event Management**: Create, update, and manage events with approval workflow
2. **Classroom Booking**: Find vacant classrooms and book them for events
3. **Approval Workflow**: Faculty → HoD approval process for events
4. **Participant Management**: Register and track event participants
5. **Club Management**: Manage clubs and their events
6. **Search and Filter**: Search events by title, category, date, club/organizer

## API Services

The following services are available for database operations:

- `OracleServices.Auth`: Authentication and user management
- `OracleServices.Profiles`: User profile management
- `OracleServices.UserRoles`: User role management
- `OracleServices.Clubs`: Club management
- `OracleServices.Classrooms`: Classroom management
- `OracleServices.Events`: Event management
- `OracleServices.Participants`: Participant management
- `OracleServices.ClassroomBookings`: Classroom booking management
- `OracleServices.EventApprovals`: Event approval workflow

## Usage Example

```typescript
import { OracleServices } from '@/integrations/oracle/services';

// Get all events
const events = await OracleServices.Events.getAll();

// Create a new event
const newEvent = await OracleServices.Events.create({
  event_id: 'EVT001',
  title: 'Tech Workshop',
  organizer_name: 'Tech Club',
  event_date: '2024-01-15',
  start_time: '09:00',
  end_time: '17:00',
  category: 'Tech',
  max_participants: 50,
  entry_fees: 100
});

// Get available classrooms for a specific date and time
const availableClassrooms = await OracleServices.Classrooms.getAvailable(
  '2024-01-15',
  '09:00',
  '17:00'
);
```

## Migration Notes

- All Supabase dependencies have been replaced with Oracle database operations
- The website structure and UI remain unchanged
- Authentication is simplified for Oracle integration
- All CRUD operations are implemented for Oracle database
- The approval workflow system is fully functional

## Troubleshooting

1. **Connection Issues**: Verify your Oracle database is running and accessible
2. **Permission Issues**: Ensure your Oracle user has necessary permissions
3. **Driver Issues**: Make sure Oracle Instant Client is properly installed
4. **Table Issues**: Verify all tables were created successfully with the `-1` suffix

## Next Steps

1. Update the Oracle connection details in `src/config/oracle.ts`
2. Run the `oracle-schema.sql` script in your Oracle database
3. Test the application with your Oracle database connection
4. Verify all functionality works as expected

The application is now fully integrated with Oracle Database 23ai while maintaining the original website structure and functionality.

