-- Oracle Database Schema for Event Management System
-- Tables with -1 suffix as requested

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE profiles_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE user_roles_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE clubs_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE classrooms_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE events_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE participants_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE classroom_bookings_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE event_approvals_seq START WITH 1 INCREMENT BY 1;

-- Create profiles table
CREATE TABLE profiles_1 (
    id NUMBER PRIMARY KEY,
    full_name VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    contact_no VARCHAR2(20),
    department VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE user_roles_1 (
    id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    role VARCHAR2(20) NOT NULL CHECK (role IN ('student', 'faculty', 'hod', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES profiles_1(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE (user_id, role)
);

-- Create clubs table
CREATE TABLE clubs_1 (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) NOT NULL UNIQUE,
    description CLOB NOT NULL,
    coordinator_email VARCHAR2(255) NOT NULL,
    coordinator_contact VARCHAR2(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classrooms table
CREATE TABLE classrooms_1 (
    id NUMBER PRIMARY KEY,
    room_number VARCHAR2(50) NOT NULL UNIQUE,
    building VARCHAR2(100) NOT NULL,
    capacity NUMBER NOT NULL CHECK (capacity > 0),
    facilities CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events_1 (
    id NUMBER PRIMARY KEY,
    event_id VARCHAR2(50) NOT NULL UNIQUE,
    title VARCHAR2(255) NOT NULL,
    club_id NUMBER,
    club_name VARCHAR2(100), -- For text input instead of dropdown
    faculty_coordinator VARCHAR2(100) NOT NULL,
    student_coordinator VARCHAR2(100) NOT NULL,
    description CLOB,
    event_date DATE NOT NULL,
    start_time VARCHAR2(8) NOT NULL,
    end_time VARCHAR2(8) NOT NULL,
    venue_id NUMBER,
    category VARCHAR2(20) NOT NULL CHECK (category IN ('Tech', 'Non-Tech')),
    max_participants NUMBER CHECK (max_participants > 0),
    entry_fees NUMBER(10,2) DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'proposed' CHECK (status IN ('proposed', 'faculty_approved', 'hod_approved', 'rejected')),
    created_by NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs_1(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES classrooms_1(id) ON DELETE SET NULL,
    CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES profiles_1(id) ON DELETE SET NULL
);

-- Create participants table
CREATE TABLE participants_1 (
    id NUMBER PRIMARY KEY,
    event_id NUMBER NOT NULL,
    register_no VARCHAR2(50) NOT NULL,
    student_name VARCHAR2(255) NOT NULL,
    contact_no VARCHAR2(20) NOT NULL,
    year_of_study NUMBER NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
    department VARCHAR2(100) NOT NULL,
    payment_completed NUMBER(1) DEFAULT 0 CHECK (payment_completed IN (0, 1)),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participants_event FOREIGN KEY (event_id) REFERENCES events_1(id) ON DELETE CASCADE,
    CONSTRAINT uk_participant_event UNIQUE (event_id, register_no)
);

-- Create classroom_bookings table
CREATE TABLE classroom_bookings_1 (
    id NUMBER PRIMARY KEY,
    classroom_id NUMBER NOT NULL,
    event_id NUMBER,
    booking_date DATE NOT NULL,
    start_time VARCHAR2(8) NOT NULL,
    end_time VARCHAR2(8) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    booked_by NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms_1(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES events_1(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_user FOREIGN KEY (booked_by) REFERENCES profiles_1(id) ON DELETE SET NULL
);

-- Create event_approvals table
CREATE TABLE event_approvals_1 (
    id NUMBER PRIMARY KEY,
    event_id NUMBER NOT NULL,
    approver_role VARCHAR2(20) NOT NULL CHECK (approver_role IN ('student', 'faculty', 'hod', 'admin')),
    approver_id NUMBER,
    status VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments CLOB,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approvals_event FOREIGN KEY (event_id) REFERENCES events_1(id) ON DELETE CASCADE,
    CONSTRAINT fk_approvals_user FOREIGN KEY (approver_id) REFERENCES profiles_1(id) ON DELETE SET NULL
);

-- Create triggers for auto-incrementing IDs
CREATE OR REPLACE TRIGGER profiles_trigger
    BEFORE INSERT ON profiles_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := profiles_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER user_roles_trigger
    BEFORE INSERT ON user_roles_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := user_roles_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER clubs_trigger
    BEFORE INSERT ON clubs_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := clubs_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER classrooms_trigger
    BEFORE INSERT ON classrooms_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := classrooms_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER events_trigger
    BEFORE INSERT ON events_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := events_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER participants_trigger
    BEFORE INSERT ON participants_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := participants_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER classroom_bookings_trigger
    BEFORE INSERT ON classroom_bookings_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := classroom_bookings_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER event_approvals_trigger
    BEFORE INSERT ON event_approvals_1
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := event_approvals_seq.NEXTVAL;
    END IF;
END;
/

-- Create trigger for updating events updated_at timestamp
CREATE OR REPLACE TRIGGER update_events_timestamp
    BEFORE UPDATE ON events_1
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Create indexes for better performance
CREATE INDEX idx_events_date_1 ON events_1(event_date);
CREATE INDEX idx_events_status_1 ON events_1(status);
CREATE INDEX idx_events_club_1 ON events_1(club_id);
CREATE INDEX idx_events_category_1 ON events_1(category);
CREATE INDEX idx_classroom_bookings_date_1 ON classroom_bookings_1(booking_date);
CREATE INDEX idx_classroom_bookings_classroom_1 ON classroom_bookings_1(classroom_id);
CREATE INDEX idx_participants_event_1 ON participants_1(event_id);
CREATE INDEX idx_user_roles_user_1 ON user_roles_1(user_id);

-- Insert sample data
INSERT INTO profiles_1 (full_name, email, contact_no, department) VALUES 
('Admin User', 'admin@college.edu', '1234567890', 'IT');
INSERT INTO profiles_1 (full_name, email, contact_no, department) VALUES 
('Faculty User', 'faculty@college.edu', '1234567891', 'Computer Science');
INSERT INTO profiles_1 (full_name, email, contact_no, department) VALUES 
('Student User', 'student@college.edu', '1234567892', 'Computer Science');

INSERT INTO user_roles_1 (user_id, role) VALUES (1, 'admin');
INSERT INTO user_roles_1 (user_id, role) VALUES (2, 'faculty');
INSERT INTO user_roles_1 (user_id, role) VALUES (3, 'student');

INSERT INTO clubs_1 (name, description, coordinator_email, coordinator_contact) VALUES 
('Tech Club', 'Technology enthusiasts club', 'tech@college.edu', '9876543210');
INSERT INTO clubs_1 (name, description, coordinator_email, coordinator_contact) VALUES 
('Cultural Club', 'Cultural activities club', 'cultural@college.edu', '9876543211');

INSERT INTO classrooms_1 (room_number, building, capacity, facilities) VALUES 
('A101', 'Building A', 50, 'Projector, Whiteboard, AC');
INSERT INTO classrooms_1 (room_number, building, capacity, facilities) VALUES 
('A102', 'Building A', 30, 'Whiteboard, AC');
INSERT INTO classrooms_1 (room_number, building, capacity, facilities) VALUES 
('B201', 'Building B', 100, 'Projector, Whiteboard, AC, Sound System');

COMMIT;
