import { oracleDb } from './client';
import { DemoOracleServices } from './demo';
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  UserRole,
  UserRoleInsert,
  UserRoleUpdate,
  Club,
  ClubInsert,
  ClubUpdate,
  Classroom,
  ClassroomInsert,
  ClassroomUpdate,
  Event,
  EventInsert,
  EventUpdate,
  Participant,
  ParticipantInsert,
  ParticipantUpdate,
  ClassroomBooking,
  ClassroomBookingInsert,
  ClassroomBookingUpdate,
  EventApproval,
  EventApprovalInsert,
  EventApprovalUpdate,
  AppRole,
  ApprovalStatus,
  EventCategory,
  EventStatus
} from './types';

// Authentication service (simplified for Oracle)
export class AuthService {
  private static currentUser: Profile | null = null;

  static async signIn(email: string, password: string): Promise<Profile | null> {
    try {
      // Use demo mode for browser compatibility
      return await DemoOracleServices.signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  }

  static async signUp(userData: ProfileInsert): Promise<Profile | null> {
    try {
      // Use demo mode for browser compatibility
      return await DemoOracleServices.signUp(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      return null;
    }
  }

  static async signOut(): Promise<void> {
    this.currentUser = null;
  }

  static getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  static async getUserRoles(userId: number): Promise<UserRole[]> {
    return oracleDb.select<UserRole>('user_roles_1', 'user_id = :1', [userId]);
  }

  static async hasRole(userId: number, role: AppRole): Promise<boolean> {
    return oracleDb.exists('user_roles_1', 'user_id = :1 AND role = :2', [userId, role]);
  }
}

// Profiles service
export class ProfilesService {
  static async getAll(): Promise<Profile[]> {
    return oracleDb.select<Profile>('profiles_1');
  }

  static async getById(id: number): Promise<Profile | null> {
    return oracleDb.getById<Profile>('profiles_1', id);
  }

  static async create(data: ProfileInsert): Promise<Profile> {
    return oracleDb.insert<Profile>('profiles_1', data);
  }

  static async update(id: number, data: ProfileUpdate): Promise<Profile> {
    return oracleDb.update<Profile>('profiles_1', id, data);
  }

  static async delete(id: number): Promise<boolean> {
    return oracleDb.delete('profiles_1', id);
  }
}

// User Roles service
export class UserRolesService {
  static async getAll(): Promise<UserRole[]> {
    return oracleDb.select<UserRole>('user_roles_1');
  }

  static async getByUserId(userId: number): Promise<UserRole[]> {
    return oracleDb.select<UserRole>('user_roles_1', 'user_id = :1', [userId]);
  }

  static async create(data: UserRoleInsert): Promise<UserRole> {
    return oracleDb.insert<UserRole>('user_roles_1', data);
  }

  static async update(id: number, data: UserRoleUpdate): Promise<UserRole> {
    return oracleDb.update<UserRole>('user_roles_1', id, data);
  }

  static async delete(id: number): Promise<boolean> {
    return oracleDb.delete('user_roles_1', id);
  }
}

// Clubs service
export class ClubsService {
  static async getAll(): Promise<Club[]> {
    try {
      return await oracleDb.select<Club>('clubs_1');
    } catch (error) {
      console.error('Error getting clubs:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Club | null> {
    return oracleDb.getById<Club>('clubs_1', id);
  }

  static async create(data: ClubInsert): Promise<Club> {
    try {
      return await oracleDb.insert<Club>('clubs_1', data);
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }

  static async update(id: number, data: ClubUpdate): Promise<Club> {
    try {
      return await oracleDb.update<Club>('clubs_1', id, data);
    } catch (error) {
      console.error('Error updating club:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/api/clubs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete club: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting club:', error);
      return false;
    }
  }
}

// Classrooms service
export class ClassroomsService {
  static async getAll(): Promise<Classroom[]> {
    try {
      return await oracleDb.select<Classroom>('classrooms_1');
    } catch (error) {
      console.error('Error getting classrooms:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Classroom | null> {
    try {
      return await oracleDb.getById<Classroom>('classrooms_1', id);
    } catch (error) {
      console.error('Error getting classroom:', error);
      return null;
    }
  }

  static async getAvailable(date: string, startTime: string, endTime: string): Promise<Classroom[]> {
    try {
      // Make API call to get available classrooms
      const response = await fetch(`http://localhost:3001/api/classrooms/available?date=${date}&startTime=${startTime}&endTime=${endTime}`);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting available classrooms:', error);
      return [];
    }
  }

  static async create(data: ClassroomInsert): Promise<Classroom> {
    try {
      return await oracleDb.insert<Classroom>('classrooms_1', data);
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  }

  static async update(id: number, data: ClassroomUpdate): Promise<Classroom> {
    try {
      return await oracleDb.update<Classroom>('classrooms_1', id, data);
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/api/classrooms/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');
      return true;
    } catch (error) {
      console.error('Error deleting classroom:', error);
      return false;
    }
  }
}

// Events service
export class EventsService {
  static async getAll(): Promise<Event[]> {
    try {
      return await oracleDb.select<Event>('events_1');
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Event | null> {
    return oracleDb.getById<Event>('events_1', id);
  }

  static async getByEventId(eventId: string): Promise<Event | null> {
    const events = await oracleDb.select<Event>('events_1', 'event_id = :1', [eventId]);
    return events.length > 0 ? events[0] : null;
  }

  static async searchByTitle(title: string): Promise<Event[]> {
    return oracleDb.select<Event>('events_1', 'UPPER(title) LIKE UPPER(:1)', [`%${title}%`]);
  }

  static async searchByCategory(category: EventCategory): Promise<Event[]> {
    return oracleDb.select<Event>('events_1', 'category = :1', [category]);
  }

  static async searchByDate(date: string): Promise<Event[]> {
    return oracleDb.select<Event>('events_1', 'event_date = :1', [date]);
  }

  static async searchByClub(clubId: number): Promise<Event[]> {
    return oracleDb.select<Event>('events_1', 'club_id = :1', [clubId]);
  }

  static async getByStatus(status: EventStatus): Promise<Event[]> {
    return oracleDb.select<Event>('events_1', 'status = :1', [status]);
  }

  static async create(data: EventInsert): Promise<Event> {
    try {
      return await oracleDb.insert<Event>('events_1', data);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async update(id: number, data: EventUpdate): Promise<Event> {
    try {
      return await oracleDb.update<Event>('events_1', id, data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }
}

// Participants service
export class ParticipantsService {
  static async getAll(): Promise<Participant[]> {
    return oracleDb.select<Participant>('participants_1');
  }

  static async getById(id: number): Promise<Participant | null> {
    return oracleDb.getById<Participant>('participants_1', id);
  }

  static async getByEventId(eventId: number): Promise<Participant[]> {
    return oracleDb.select<Participant>('participants_1', 'event_id = :1', [eventId]);
  }

  static async getByRegisterNo(registerNo: string): Promise<Participant[]> {
    return oracleDb.select<Participant>('participants_1', 'register_no = :1', [registerNo]);
  }

  static async create(data: ParticipantInsert): Promise<Participant> {
    return oracleDb.insert<Participant>('participants_1', data);
  }

  static async update(id: number, data: ParticipantUpdate): Promise<Participant> {
    return oracleDb.update<Participant>('participants_1', id, data);
  }

  static async delete(id: number): Promise<boolean> {
    return oracleDb.delete('participants_1', id);
  }

  static async getEventParticipationCount(eventId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM participants_1 WHERE event_id = :1';
    const result = await oracleDb.executeQuery<{ count: number }>(sql, [eventId]);
    return result[0].count;
  }
}

// Classroom Bookings service
export class ClassroomBookingsService {
  static async getAll(): Promise<ClassroomBooking[]> {
    try {
      const response = await fetch('http://localhost:3001/api/classroom-bookings');
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Error getting classroom bookings:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<ClassroomBooking | null> {
    return oracleDb.getById<ClassroomBooking>('classroom_bookings_1', id);
  }

  static async getByClassroomId(classroomId: number): Promise<ClassroomBooking[]> {
    return oracleDb.select<ClassroomBooking>('classroom_bookings_1', 'classroom_id = :1', [classroomId]);
  }

  static async getByEventId(eventId: number): Promise<ClassroomBooking[]> {
    return oracleDb.select<ClassroomBooking>('classroom_bookings_1', 'event_id = :1', [eventId]);
  }

  static async getByDate(date: string): Promise<ClassroomBooking[]> {
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        fetch(`http://localhost:3001/api/classroom-bookings?date=${date}`),
        fetch(`http://localhost:3001/api/events/by-date?date=${date}`)
      ]);
      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
      if (!eventsRes.ok) throw new Error('Failed to fetch events');
      const bookings = await bookingsRes.json();
      const events = await eventsRes.json();
      // Enrich bookings with club_name/time from events if missing
      const eventById = new Map(events.map((e: any) => [e.id, e]));
      return bookings.map((b: any) => {
        const ev = b.events?.id ? eventById.get(b.events.id) : null;
        return ev ? {
          ...b,
          events: {
            ...b.events,
            club_name: ev.club_name,
            start_time: ev.start_time,
            end_time: ev.end_time,
          }
        } : b;
      });
    } catch (error) {
      console.error('Error getting classroom bookings by date:', error);
      return [];
    }
  }

  static async getByStatus(status: ApprovalStatus): Promise<ClassroomBooking[]> {
    return oracleDb.select<ClassroomBooking>('classroom_bookings_1', 'status = :1', [status]);
  }

  static async create(data: ClassroomBookingInsert): Promise<ClassroomBooking> {
    try {
      return await oracleDb.insert<ClassroomBooking>('classroom_bookings_1', data);
    } catch (error) {
      console.error('Error creating classroom booking:', error);
      throw error;
    }
  }

  static async update(id: number, data: ClassroomBookingUpdate): Promise<ClassroomBooking> {
    try {
      return await oracleDb.update<ClassroomBooking>('classroom_bookings_1', id, data);
    } catch (error) {
      console.error('Error updating classroom booking:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/api/classroom-bookings/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');
      return true;
    } catch (error) {
      console.error('Error deleting classroom booking:', error);
      return false;
    }
  }
}

// Event Approvals service
export class EventApprovalsService {
  static async getAll(): Promise<EventApproval[]> {
    return oracleDb.select<EventApproval>('event_approvals_1');
  }

  static async getById(id: number): Promise<EventApproval | null> {
    return oracleDb.getById<EventApproval>('event_approvals_1', id);
  }

  static async getByEventId(eventId: number): Promise<EventApproval[]> {
    return oracleDb.select<EventApproval>('event_approvals_1', 'event_id = :1', [eventId]);
  }

  static async getByApproverId(approverId: number): Promise<EventApproval[]> {
    return oracleDb.select<EventApproval>('event_approvals_1', 'approver_id = :1', [approverId]);
  }

  static async getByStatus(status: ApprovalStatus): Promise<EventApproval[]> {
    return oracleDb.select<EventApproval>('event_approvals_1', 'status = :1', [status]);
  }

  static async create(data: EventApprovalInsert): Promise<EventApproval> {
    return oracleDb.insert<EventApproval>('event_approvals_1', data);
  }

  static async update(id: number, data: EventApprovalUpdate): Promise<EventApproval> {
    return oracleDb.update<EventApproval>('event_approvals_1', id, data);
  }

  static async delete(id: number): Promise<boolean> {
    return oracleDb.delete('event_approvals_1', id);
  }
}

// Export all services
export const OracleServices = {
  Auth: AuthService,
  Profiles: ProfilesService,
  UserRoles: UserRolesService,
  Clubs: ClubsService,
  Classrooms: ClassroomsService,
  Events: EventsService,
  Participants: ParticipantsService,
  ClassroomBookings: ClassroomBookingsService,
  EventApprovals: EventApprovalsService,
};
