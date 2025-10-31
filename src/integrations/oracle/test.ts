// Oracle Database Integration Test
// This file can be used to test the Oracle database integration

import { OracleServices } from './services';
import { oracleDb } from './client';

export class OracleIntegrationTest {
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Oracle database connection...');
      
      // Test basic connection
      const result = await oracleDb.executeQuery('SELECT 1 as test FROM DUAL');
      console.log('Connection test result:', result);
      
      return result.length > 0 && result[0].test === 1;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  static async testTablesExist(): Promise<boolean> {
    try {
      console.log('Testing if all tables exist...');
      
      const tables = [
        'profiles_1',
        'user_roles_1', 
        'clubs_1',
        'classrooms_1',
        'events_1',
        'participants_1',
        'classroom_bookings_1',
        'event_approvals_1'
      ];

      for (const table of tables) {
        const result = await oracleDb.executeQuery(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        console.log(`Table ${table} exists with ${result[0].count} records`);
      }
      
      return true;
    } catch (error) {
      console.error('Table existence test failed:', error);
      return false;
    }
  }

  static async testCRUDOperations(): Promise<boolean> {
    try {
      console.log('Testing CRUD operations...');
      
      // Test Profile creation
      const testProfile = await OracleServices.Profiles.create({
        full_name: 'Test User',
        email: 'test@example.com',
        contact_no: '1234567890',
        department: 'Computer Science'
      });
      console.log('Created profile:', testProfile);
      
      // Test Profile retrieval
      const retrievedProfile = await OracleServices.Profiles.getById(testProfile.id);
      console.log('Retrieved profile:', retrievedProfile);
      
      // Test Profile update
      const updatedProfile = await OracleServices.Profiles.update(testProfile.id, {
        id: testProfile.id,
        department: 'Information Technology'
      });
      console.log('Updated profile:', updatedProfile);
      
      // Test Club creation
      const testClub = await OracleServices.Clubs.create({
        name: 'Test Club',
        description: 'A test club for integration testing',
        coordinator_email: 'coordinator@example.com',
        coordinator_contact: '9876543210'
      });
      console.log('Created club:', testClub);
      
      // Test Classroom creation
      const testClassroom = await OracleServices.Classrooms.create({
        room_number: 'TEST101',
        building: 'Test Building',
        capacity: 50,
        facilities: 'Projector, Whiteboard, AC'
      });
      console.log('Created classroom:', testClassroom);
      
      // Test Event creation
      const testEvent = await OracleServices.Events.create({
        event_id: 'TEST001',
        title: 'Test Event',
        club_id: testClub.id,
        organizer_name: 'Test Organizer',
        description: 'A test event for integration testing',
        event_date: '2024-12-31',
        start_time: '09:00',
        end_time: '17:00',
        venue_id: testClassroom.id,
        category: 'Tech',
        max_participants: 30,
        entry_fees: 50,
        status: 'proposed'
      });
      console.log('Created event:', testEvent);
      
      // Test Participant creation
      const testParticipant = await OracleServices.Participants.create({
        event_id: testEvent.id,
        register_no: 'REG001',
        student_name: 'Test Student',
        contact_no: '5555555555',
        year_of_study: 3,
        department: 'Computer Science',
        payment_completed: true
      });
      console.log('Created participant:', testParticipant);
      
      // Test Classroom Booking creation
      const testBooking = await OracleServices.ClassroomBookings.create({
        classroom_id: testClassroom.id,
        event_id: testEvent.id,
        booking_date: '2024-12-31',
        start_time: '09:00',
        end_time: '17:00',
        status: 'pending'
      });
      console.log('Created classroom booking:', testBooking);
      
      // Test Event Approval creation
      const testApproval = await OracleServices.EventApprovals.create({
        event_id: testEvent.id,
        approver_role: 'faculty',
        status: 'pending',
        comments: 'Test approval comment'
      });
      console.log('Created event approval:', testApproval);
      
      // Test search operations
      const eventsByCategory = await OracleServices.Events.searchByCategory('Tech');
      console.log('Events by category:', eventsByCategory);
      
      const availableClassrooms = await OracleServices.Classrooms.getAvailable(
        '2024-12-31',
        '09:00',
        '17:00'
      );
      console.log('Available classrooms:', availableClassrooms);
      
      console.log('All CRUD operations completed successfully!');
      return true;
      
    } catch (error) {
      console.error('CRUD operations test failed:', error);
      return false;
    }
  }

  static async runAllTests(): Promise<void> {
    console.log('Starting Oracle Database Integration Tests...');
    console.log('==========================================');
    
    const connectionTest = await this.testConnection();
    console.log(`Connection Test: ${connectionTest ? 'PASSED' : 'FAILED'}`);
    
    const tablesTest = await this.testTablesExist();
    console.log(`Tables Test: ${tablesTest ? 'PASSED' : 'FAILED'}`);
    
    const crudTest = await this.testCRUDOperations();
    console.log(`CRUD Operations Test: ${crudTest ? 'PASSED' : 'FAILED'}`);
    
    console.log('==========================================');
    console.log('Oracle Database Integration Tests Complete');
    
    if (connectionTest && tablesTest && crudTest) {
      console.log('✅ All tests PASSED! Oracle integration is working correctly.');
    } else {
      console.log('❌ Some tests FAILED! Please check your Oracle database setup.');
    }
  }
}

// Export for use in other files
export default OracleIntegrationTest;

