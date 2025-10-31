// Demo Mode Oracle Client - Works without database connection
// This provides a fallback when Oracle database is not available

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

// Demo data
const DEMO_PROFILES: Profile[] = [
  {
    id: 1,
    full_name: 'Admin User',
    email: 'admin@college.edu',
    contact_no: '1234567890',
    department: 'IT',
    created_at: new Date()
  },
  {
    id: 2,
    full_name: 'Faculty User',
    email: 'faculty@college.edu',
    contact_no: '1234567891',
    department: 'Computer Science',
    created_at: new Date()
  },
  {
    id: 3,
    full_name: 'Student User',
    email: 'student@college.edu',
    contact_no: '1234567892',
    department: 'Computer Science',
    created_at: new Date()
  }
];

const DEMO_CLUBS: Club[] = [
  {
    id: 1,
    name: 'Tech Club',
    description: 'Technology enthusiasts club',
    coordinator_email: 'tech@college.edu',
    coordinator_contact: '9876543210',
    created_at: new Date()
  },
  {
    id: 2,
    name: 'Cultural Club',
    description: 'Cultural activities club',
    coordinator_email: 'cultural@college.edu',
    coordinator_contact: '9876543211',
    created_at: new Date()
  }
];

const DEMO_CLASSROOMS: Classroom[] = [
  {
    id: 1,
    room_number: 'A101',
    building: 'Building A',
    capacity: 50,
    facilities: 'Projector, Whiteboard, AC',
    created_at: new Date()
  },
  {
    id: 2,
    room_number: 'A102',
    building: 'Building A',
    capacity: 30,
    facilities: 'Whiteboard, AC',
    created_at: new Date()
  },
  {
    id: 3,
    room_number: 'B201',
    building: 'Building B',
    capacity: 100,
    facilities: 'Projector, Whiteboard, AC, Sound System',
    created_at: new Date()
  }
];

const DEMO_EVENTS: Event[] = [
  {
    id: 1,
    event_id: 'EVT001',
    title: 'Tech Workshop',
    club_id: 1,
    club_name: 'Tech Club',
    faculty_coordinator: 'Dr. Smith',
    student_coordinator: 'John Doe',
    description: 'Learn the latest technologies',
    event_date: '2024-12-25',
    start_time: '09:00',
    end_time: '17:00',
    venue_id: 1,
    category: 'Tech',
    max_participants: 50,
    entry_fees: 100,
    status: 'proposed',
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    event_id: 'EVT002',
    title: 'Cultural Festival',
    club_id: 2,
    club_name: 'Cultural Club',
    faculty_coordinator: 'Prof. Johnson',
    student_coordinator: 'Jane Smith',
    description: 'Annual cultural celebration',
    event_date: '2024-12-30',
    start_time: '10:00',
    end_time: '18:00',
    venue_id: 3,
    category: 'Non-Tech',
    max_participants: 200,
    entry_fees: 50,
    status: 'faculty_approved',
    created_by: 2,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Demo mode services with localStorage persistence
export class DemoOracleServices {
  private static eventCounter = 3; // Start from 3 since we have 2 existing events

  // Helper methods for localStorage
  private static getStoredData<T>(key: string, defaultValue: T[]): T[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private static setStoredData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  static async getAllProfiles(): Promise<Profile[]> {
    return Promise.resolve(this.getStoredData('demo_profiles', DEMO_PROFILES));
  }

  static async getAllClubs(): Promise<Club[]> {
    return Promise.resolve(this.getStoredData('demo_clubs', DEMO_CLUBS));
  }

  static async getAllClassrooms(): Promise<Classroom[]> {
    return Promise.resolve(this.getStoredData('demo_classrooms', DEMO_CLASSROOMS));
  }

  static async getAllEvents(): Promise<Event[]> {
    return Promise.resolve(this.getStoredData('demo_events', DEMO_EVENTS));
  }

  static async getAvailableClassrooms(date: string, startTime: string, endTime: string): Promise<Classroom[]> {
    // Return all classrooms as available in demo mode
    return Promise.resolve(this.getStoredData('demo_classrooms', DEMO_CLASSROOMS));
  }

  static async createEvent(data: EventInsert): Promise<Event> {
    const events = this.getStoredData('demo_events', DEMO_EVENTS);
    const newEvent: Event = {
      id: ++this.eventCounter,
      event_id: data.event_id,
      title: data.title,
      club_id: data.club_id,
      club_name: data.club_name,
      faculty_coordinator: data.faculty_coordinator,
      student_coordinator: data.student_coordinator,
      description: data.description,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      venue_id: data.venue_id,
      category: data.category,
      max_participants: data.max_participants,
      entry_fees: data.entry_fees,
      status: data.status || 'proposed',
      created_by: data.created_by,
      created_at: new Date(),
      updated_at: new Date()
    };
    events.push(newEvent);
    this.setStoredData('demo_events', events);
    return Promise.resolve(newEvent);
  }

  static async createClub(data: ClubInsert): Promise<Club> {
    const clubs = this.getStoredData('demo_clubs', DEMO_CLUBS);
    const newClub: Club = {
      id: clubs.length + 1,
      name: data.name,
      description: data.description,
      coordinator_email: data.coordinator_email,
      coordinator_contact: data.coordinator_contact,
      created_at: new Date()
    };
    clubs.push(newClub);
    this.setStoredData('demo_clubs', clubs);
    return Promise.resolve(newClub);
  }

  static async createClassroom(data: ClassroomInsert): Promise<Classroom> {
    const classrooms = this.getStoredData('demo_classrooms', DEMO_CLASSROOMS);
    const newClassroom: Classroom = {
      id: classrooms.length + 1,
      room_number: data.room_number,
      building: data.building,
      capacity: data.capacity,
      facilities: data.facilities,
      created_at: new Date()
    };
    classrooms.push(newClassroom);
    this.setStoredData('demo_classrooms', classrooms);
    return Promise.resolve(newClassroom);
  }

  static async createClassroomBooking(data: ClassroomBookingInsert): Promise<ClassroomBooking> {
    const bookings = this.getStoredData('demo_classroom_bookings', []);
    const newBooking: ClassroomBooking = {
      id: Math.floor(Math.random() * 1000) + 1,
      classroom_id: data.classroom_id,
      event_id: data.event_id,
      booking_date: data.booking_date,
      start_time: data.start_time,
      end_time: data.end_time,
      status: data.status || 'pending',
      booked_by: data.booked_by,
      created_at: new Date()
    };
    bookings.push(newBooking);
    this.setStoredData('demo_classroom_bookings', bookings);
    return Promise.resolve(newBooking);
  }

  static async signIn(email: string, password: string): Promise<Profile | null> {
    const profiles = this.getStoredData('demo_profiles', DEMO_PROFILES);
    const user = profiles.find(p => p.email === email);
    return Promise.resolve(user || null);
  }

  static async signUp(userData: ProfileInsert): Promise<Profile> {
    const profiles = this.getStoredData('demo_profiles', DEMO_PROFILES);
    const newUser: Profile = {
      id: profiles.length + 1,
      full_name: userData.full_name,
      email: userData.email,
      contact_no: userData.contact_no,
      department: userData.department,
      created_at: new Date()
    };
    profiles.push(newUser);
    this.setStoredData('demo_profiles', profiles);
    return Promise.resolve(newUser);
  }
}

// Check if we're in demo mode (Oracle connection failed)
let isDemoMode = false;

export const setDemoMode = (demo: boolean) => {
  isDemoMode = demo;
};

export const getIsDemoMode = () => isDemoMode;
