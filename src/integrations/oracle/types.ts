// Oracle Database Types for Event Management System
// Tables with -1 suffix as requested

export type AppRole = 'student' | 'faculty' | 'hod' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type EventCategory = 'Tech' | 'Non-Tech';
export type EventStatus = 'proposed' | 'faculty_approved' | 'hod_approved' | 'rejected';

// Base table interfaces
export interface Profile {
  id: number;
  full_name: string;
  email: string;
  contact_no?: string;
  department?: string;
  created_at: Date;
}

export interface UserRole {
  id: number;
  user_id: number;
  role: AppRole;
  created_at: Date;
}

export interface Club {
  id: number;
  name: string;
  description?: string;
  coordinator_email?: string;
  coordinator_contact?: string;
  created_at: Date;
}

export interface Classroom {
  id: number;
  room_number: string;
  building: string;
  capacity: number;
  facilities?: string;
  created_at: Date;
}

export interface Event {
  id: number;
  event_id: string;
  title: string;
  club_id?: number;
  club_name?: string; // For text input instead of dropdown
  faculty_coordinator: string;
  student_coordinator: string;
  description?: string;
  event_date: string; // Date as string for Oracle compatibility
  start_time: string;
  end_time: string;
  venue_id?: number;
  category: EventCategory;
  max_participants?: number;
  entry_fees?: number;
  status: EventStatus;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Participant {
  id: number;
  event_id: number;
  register_no: string;
  student_name: string;
  contact_no: string;
  year_of_study: number;
  department: string;
  payment_completed: boolean;
  registered_at: Date;
}

export interface ClassroomBooking {
  id: number;
  classroom_id: number;
  event_id?: number;
  booking_date: string; // Date as string for Oracle compatibility
  start_time: string;
  end_time: string;
  status: ApprovalStatus;
  booked_by?: number;
  created_at: Date;
}

export interface EventApproval {
  id: number;
  event_id: number;
  approver_role: AppRole;
  approver_id?: number;
  status: ApprovalStatus;
  comments?: string;
  approved_at?: Date;
  created_at: Date;
}

// Insert types (without auto-generated fields)
export interface ProfileInsert {
  full_name: string;
  email: string;
  contact_no?: string;
  department?: string;
}

export interface UserRoleInsert {
  user_id: number;
  role: AppRole;
}

export interface ClubInsert {
  name: string;
  description?: string;
  coordinator_email?: string;
  coordinator_contact?: string;
}

export interface ClassroomInsert {
  room_number: string;
  building: string;
  capacity: number;
  facilities?: string;
}

export interface EventInsert {
  event_id: string;
  title: string;
  club_id?: number;
  club_name?: string; // For text input instead of dropdown
  faculty_coordinator: string;
  student_coordinator: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_id?: number;
  category: EventCategory;
  max_participants?: number;
  entry_fees?: number;
  status?: EventStatus;
  created_by?: number;
}

export interface ParticipantInsert {
  event_id: number;
  register_no: string;
  student_name: string;
  contact_no: string;
  year_of_study: number;
  department: string;
  payment_completed?: boolean;
}

export interface ClassroomBookingInsert {
  classroom_id: number;
  event_id?: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status?: ApprovalStatus;
  booked_by?: number;
}

export interface EventApprovalInsert {
  event_id: number;
  approver_role: AppRole;
  approver_id?: number;
  status?: ApprovalStatus;
  comments?: string;
}

// Update types (all fields optional except id)
export interface ProfileUpdate {
  id: number;
  full_name?: string;
  email?: string;
  contact_no?: string;
  department?: string;
}

export interface UserRoleUpdate {
  id: number;
  user_id?: number;
  role?: AppRole;
}

export interface ClubUpdate {
  id: number;
  name?: string;
  description?: string;
  coordinator_email?: string;
  coordinator_contact?: string;
}

export interface ClassroomUpdate {
  id: number;
  room_number?: string;
  building?: string;
  capacity?: number;
  facilities?: string;
}

export interface EventUpdate {
  id: number;
  event_id?: string;
  title?: string;
  club_id?: number;
  club_name?: string; // For text input instead of dropdown
  faculty_coordinator?: string;
  student_coordinator?: string;
  description?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  venue_id?: number;
  category?: EventCategory;
  max_participants?: number;
  entry_fees?: number;
  status?: EventStatus;
  created_by?: number;
}

export interface ParticipantUpdate {
  id: number;
  event_id?: number;
  register_no?: string;
  student_name?: string;
  contact_no?: string;
  year_of_study?: number;
  department?: string;
  payment_completed?: boolean;
}

export interface ClassroomBookingUpdate {
  id: number;
  classroom_id?: number;
  event_id?: number;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  status?: ApprovalStatus;
  booked_by?: number;
}

export interface EventApprovalUpdate {
  id: number;
  event_id?: number;
  approver_role?: AppRole;
  approver_id?: number;
  status?: ApprovalStatus;
  comments?: string;
  approved_at?: Date;
}

// Database schema type
export interface Database {
  profiles_1: {
    Row: Profile;
    Insert: ProfileInsert;
    Update: ProfileUpdate;
  };
  user_roles_1: {
    Row: UserRole;
    Insert: UserRoleInsert;
    Update: UserRoleUpdate;
  };
  clubs_1: {
    Row: Club;
    Insert: ClubInsert;
    Update: ClubUpdate;
  };
  classrooms_1: {
    Row: Classroom;
    Insert: ClassroomInsert;
    Update: ClassroomUpdate;
  };
  events_1: {
    Row: Event;
    Insert: EventInsert;
    Update: EventUpdate;
  };
  participants_1: {
    Row: Participant;
    Insert: ParticipantInsert;
    Update: ParticipantUpdate;
  };
  classroom_bookings_1: {
    Row: ClassroomBooking;
    Insert: ClassroomBookingInsert;
    Update: ClassroomBookingUpdate;
  };
  event_approvals_1: {
    Row: EventApproval;
    Insert: EventApprovalInsert;
    Update: EventApprovalUpdate;
  };
}

// Constants for enum values
export const Constants = {
  app_role: ['student', 'faculty', 'hod', 'admin'] as const,
  approval_status: ['pending', 'approved', 'rejected'] as const,
  event_category: ['Tech', 'Non-Tech'] as const,
  event_status: ['proposed', 'faculty_approved', 'hod_approved', 'rejected'] as const,
} as const;

// Helper types for table operations
export type Tables<T extends keyof Database> = Database[T]['Row'];
export type TablesInsert<T extends keyof Database> = Database[T]['Insert'];
export type TablesUpdate<T extends keyof Database> = Database[T]['Update'];
export type Enums<T extends keyof typeof Constants> = typeof Constants[T][number];
