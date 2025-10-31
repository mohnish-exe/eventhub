// Oracle Database Client - Supabase Compatible Interface
// This file provides a Supabase-compatible interface using Oracle database

import { OracleServices } from './services';
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

// Mock session interface for compatibility
export interface Session {
  user: {
    id: string;
    email: string;
    user_metadata: any;
  };
  access_token: string;
  refresh_token: string;
}

// Mock auth interface
export interface Auth {
  getSession(): Promise<{ data: { session: Session | null } }>;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: { unsubscribe: () => void } } };
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: { user: any; session: Session | null }; error: any }>;
  signUp(credentials: { email: string; password: string; options?: { data?: any } }): Promise<{ data: { user: any; session: Session | null }; error: any }>;
  signOut(): Promise<{ error: any }>;
}

// Mock table interface
export interface Table<T> {
  select(columns?: string): QueryBuilder<T>;
  insert(data: any): QueryBuilder<T>;
  update(data: any): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
}

// Mock query builder interface
export interface QueryBuilder<T> {
  select(columns?: string): QueryBuilder<T>;
  insert(data: any): QueryBuilder<T>;
  update(data: any): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
  eq(column: string, value: any): QueryBuilder<T>;
  neq(column: string, value: any): QueryBuilder<T>;
  gt(column: string, value: any): QueryBuilder<T>;
  gte(column: string, value: any): QueryBuilder<T>;
  lt(column: string, value: any): QueryBuilder<T>;
  lte(column: string, value: any): QueryBuilder<T>;
  like(column: string, pattern: string): QueryBuilder<T>;
  ilike(column: string, pattern: string): QueryBuilder<T>;
  is(column: string, value: any): QueryBuilder<T>;
  in(column: string, values: any[]): QueryBuilder<T>;
  contains(column: string, value: any): QueryBuilder<T>;
  containedBy(column: string, value: any): QueryBuilder<T>;
  rangeGt(column: string, range: any): QueryBuilder<T>;
  rangeGte(column: string, range: any): QueryBuilder<T>;
  rangeLt(column: string, range: any): QueryBuilder<T>;
  rangeLte(column: string, range: any): QueryBuilder<T>;
  rangeAdjacent(column: string, range: any): QueryBuilder<T>;
  overlaps(column: string, value: any): QueryBuilder<T>;
  textSearch(column: string, query: string): QueryBuilder<T>;
  match(query: any): QueryBuilder<T>;
  not(column: string, operator: string, value: any): QueryBuilder<T>;
  or(filters: string): QueryBuilder<T>;
  filter(column: string, operator: string, value: any): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  range(from: number, to: number): QueryBuilder<T>;
  single(): Promise<{ data: T | null; error: any }>;
  maybeSingle(): Promise<{ data: T | null; error: any }>;
  then(onfulfilled?: (value: { data: T[] | null; error: any }) => any): Promise<any>;
}

// Oracle Query Builder implementation
class OracleQueryBuilder<T> implements QueryBuilder<T> {
  private table: string;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private whereConditions: Array<{ column: string; operator: string; value: any }> = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitCount?: number;
  private rangeFrom?: number;
  private rangeTo?: number;
  private insertData?: any;
  private updateData?: any;
  private selectColumns?: string;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string): QueryBuilder<T> {
    this.operation = 'select';
    this.selectColumns = columns;
    return this;
  }

  insert(data: any): QueryBuilder<T> {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: any): QueryBuilder<T> {
    this.operation = 'update';
    this.updateData = data;
    return this;
  }

  delete(): QueryBuilder<T> {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: '=', value });
    return this;
  }

  neq(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: '!=', value });
    return this;
  }

  gt(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: '>', value });
    return this;
  }

  gte(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: '>=', value });
    return this;
  }

  lt(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: '<', value });
    return this;
  }

  lte(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: '<=', value });
    return this;
  }

  like(column: string, pattern: string): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'LIKE', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'ILIKE', value: pattern });
    return this;
  }

  is(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'IS', value });
    return this;
  }

  in(column: string, values: any[]): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'IN', value: values });
    return this;
  }

  contains(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'CONTAINS', value });
    return this;
  }

  containedBy(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'CONTAINED_BY', value });
    return this;
  }

  rangeGt(column: string, range: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'RANGE_GT', value: range });
    return this;
  }

  rangeGte(column: string, range: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'RANGE_GTE', value: range });
    return this;
  }

  rangeLt(column: string, range: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'RANGE_LT', value: range });
    return this;
  }

  rangeLte(column: string, range: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'RANGE_LTE', value: range });
    return this;
  }

  rangeAdjacent(column: string, range: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'RANGE_ADJACENT', value: range });
    return this;
  }

  overlaps(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'OVERLAPS', value });
    return this;
  }

  textSearch(column: string, query: string): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'TEXT_SEARCH', value: query });
    return this;
  }

  match(query: any): QueryBuilder<T> {
    // Convert match query to where conditions
    Object.entries(query).forEach(([column, value]) => {
      this.eq(column, value);
    });
    return this;
  }

  not(column: string, operator: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: `NOT ${operator}`, value });
    return this;
  }

  or(filters: string): QueryBuilder<T> {
    // Simple OR implementation - in production, parse the filters string
    return this;
  }

  filter(column: string, operator: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T> {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): QueryBuilder<T> {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  async single(): Promise<{ data: T | null; error: any }> {
    try {
      const results = await this.execute();
      return { data: results.data?.[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async maybeSingle(): Promise<{ data: T | null; error: any }> {
    return this.single();
  }

  async then(onfulfilled?: (value: { data: T[] | null; error: any }) => any): Promise<any> {
    try {
      const result = await this.execute();
      return onfulfilled ? onfulfilled(result) : result;
    } catch (error) {
      const errorResult = { data: null, error };
      return onfulfilled ? onfulfilled(errorResult) : errorResult;
    }
  }

  private async execute(): Promise<{ data: T[] | null; error: any }> {
    try {
      let result: T[] = [];
      
      switch (this.operation) {
        case 'select':
          result = await this.executeSelect();
          break;
        case 'insert':
          const inserted = await this.executeInsert();
          result = [inserted];
          break;
        case 'update':
          const updated = await this.executeUpdate();
          result = [updated];
          break;
        case 'delete':
          await this.executeDelete();
          result = [];
          break;
      }

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async executeSelect(): Promise<T[]> {
    // Map table names to services
    const serviceMap: { [key: string]: any } = {
      'profiles': OracleServices.Profiles,
      'user_roles': OracleServices.UserRoles,
      'clubs': OracleServices.Clubs,
      'classrooms': OracleServices.Classrooms,
      'events': OracleServices.Events,
      'participants': OracleServices.Participants,
      'classroom_bookings': OracleServices.ClassroomBookings,
      'event_approvals': OracleServices.EventApprovals,
    };

    const service = serviceMap[this.table];
    if (!service) {
      throw new Error(`Unknown table: ${this.table}`);
    }

    // Apply filters
    if (this.whereConditions.length === 0) {
      return await service.getAll();
    }

    // Simple filter implementation
    const firstCondition = this.whereConditions[0];
    if (firstCondition.operator === '=') {
      return await service.getById(firstCondition.value);
    }

    // For more complex queries, we'd need to implement proper SQL generation
    return await service.getAll();
  }

  private async executeInsert(): Promise<T> {
    const serviceMap: { [key: string]: any } = {
      'profiles': OracleServices.Profiles,
      'user_roles': OracleServices.UserRoles,
      'clubs': OracleServices.Clubs,
      'classrooms': OracleServices.Classrooms,
      'events': OracleServices.Events,
      'participants': OracleServices.Participants,
      'classroom_bookings': OracleServices.ClassroomBookings,
      'event_approvals': OracleServices.EventApprovals,
    };

    const service = serviceMap[this.table];
    if (!service) {
      throw new Error(`Unknown table: ${this.table}`);
    }

    return await service.create(this.insertData);
  }

  private async executeUpdate(): Promise<T> {
    // Implementation for update operations
    throw new Error('Update operations not implemented in this simplified version');
  }

  private async executeDelete(): Promise<void> {
    // Implementation for delete operations
    throw new Error('Delete operations not implemented in this simplified version');
  }
}

// Oracle Table implementation
class OracleTable<T> implements Table<T> {
  constructor(private tableName: string) {}

  select(columns?: string): QueryBuilder<T> {
    return new OracleQueryBuilder<T>(this.tableName).select(columns);
  }

  insert(data: any): QueryBuilder<T> {
    return new OracleQueryBuilder<T>(this.tableName).insert(data);
  }

  update(data: any): QueryBuilder<T> {
    return new OracleQueryBuilder<T>(this.tableName).update(data);
  }

  delete(): QueryBuilder<T> {
    return new OracleQueryBuilder<T>(this.tableName).delete();
  }
}

// Main Oracle client interface
export class OracleClient {
  public auth: Auth;
  private authStateCallbacks: Array<(event: string, session: Session | null) => void> = [];
  
  constructor() {
    this.auth = {
      getSession: async () => {
        // Check for stored demo session
        const storedSession = localStorage.getItem('demo_session');
        if (storedSession) {
          try {
            const session = JSON.parse(storedSession);
            return { data: { session } };
          } catch (error) {
            localStorage.removeItem('demo_session');
          }
        }
        return { data: { session: null } };
      },
      
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        // Store the callback
        this.authStateCallbacks.push(callback);
        
        // Return subscription object
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {
                // Remove callback from array
                const index = this.authStateCallbacks.indexOf(callback);
                if (index > -1) {
                  this.authStateCallbacks.splice(index, 1);
                }
              } 
            } 
          } 
        };
      },
      
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        try {
          // Simple demo authentication - accept any email/password
          const session: Session = {
            user: {
              id: '1',
              email: credentials.email,
              user_metadata: {}
            },
            access_token: 'demo_token',
            refresh_token: 'demo_refresh_token'
          };
          
          // Store session in localStorage for persistence
          localStorage.setItem('demo_session', JSON.stringify(session));
          
          // Trigger auth state change callbacks
          this.authStateCallbacks.forEach(callback => {
            callback('SIGNED_IN', session);
          });
          
          return { data: { user: session.user, session }, error: null };
        } catch (error) {
          return { data: { user: null, session: null }, error: { message: 'Sign in failed' } };
        }
      },
      
      signUp: async (credentials: { email: string; password: string; options?: { data?: any } }) => {
        try {
          // Simple demo signup - accept any email/password
          const session: Session = {
            user: {
              id: '1',
              email: credentials.email,
              user_metadata: {}
            },
            access_token: 'demo_token',
            refresh_token: 'demo_refresh_token'
          };
          
          // Store session in localStorage for persistence
          localStorage.setItem('demo_session', JSON.stringify(session));
          
          // Trigger auth state change callbacks
          this.authStateCallbacks.forEach(callback => {
            callback('SIGNED_IN', session);
          });
          
          return { data: { user: session.user, session }, error: null };
        } catch (error) {
          return { data: { user: null, session: null }, error: { message: 'Sign up failed' } };
        }
      },
      
      signOut: async () => {
        localStorage.removeItem('demo_session');
        
        // Trigger auth state change callbacks
        this.authStateCallbacks.forEach(callback => {
          callback('SIGNED_OUT', null);
        });
        
        return { error: null };
      }
    };
  }

  // Table accessors
  from(table: string): Table<any> {
    return new OracleTable(table);
  }
}

// Export the Oracle client instance
export const oracle = new OracleClient();

// For backward compatibility, export as 'supabase'
export const supabase = oracle;
