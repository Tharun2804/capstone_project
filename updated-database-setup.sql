-- Updated Complete Database Setup
CREATE DATABASE IF NOT EXISTS capstone_db;
USE capstone_db;

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS textbooks;
DROP TABLE IF EXISTS users;

-- Create users table with all required fields
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    mobile VARCHAR(20) NULL,
    role ENUM('admin', 'reviewer', 'publisher', 'student') NOT NULL,
    
    -- Reviewer-specific fields
    qualifications TEXT NULL,
    experience TEXT NULL,
    educational_qualification VARCHAR(255) NULL,
    specialization VARCHAR(255) NULL,
    years_experience INT NULL,
    current_designation VARCHAR(255) NULL,
    current_institution VARCHAR(255) NULL,
    publications TEXT NULL,
    reviewer_type VARCHAR(100) NULL,
    proof_documents VARCHAR(500) NULL,
    application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create textbooks table with all required fields
CREATE TABLE textbooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULL,
    description TEXT NULL,
    isbn VARCHAR(50) NULL,
    publication_year INT NULL,
    file_path VARCHAR(500) NULL,
    cover_image_path VARCHAR(500) NULL,
    plagiarism_score DECIMAL(5,2) DEFAULT 0,
    publisher_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create reviews table with all required fields
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    textbook_id INT NOT NULL,
    reviewer_id INT NULL,
    reviewer_name VARCHAR(255) NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    accuracy INT CHECK (accuracy >= 1 AND accuracy <= 5),
    clarity INT CHECK (clarity >= 1 AND clarity <= 5),
    relevance INT CHECK (relevance >= 1 AND relevance <= 5),
    references_quality INT CHECK (references_quality >= 1 AND references_quality <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create assignments table
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    textbook_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, password, email, mobile, role, application_status) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', '1234567890', 'admin', 'approved');

-- Insert sample approved reviewer (password: reviewer123)
INSERT INTO users (username, password, email, mobile, role, qualifications, experience, application_status) VALUES 
('reviewer1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer@example.com', '1234567891', 'reviewer', 'PhD in Computer Science', '10 years experience in academic review', 'approved');

-- Insert sample publisher (password: publisher123)
INSERT INTO users (username, password, email, mobile, role, application_status) VALUES 
('publisher1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'publisher@example.com', '1234567892', 'publisher', 'approved');

-- Insert sample student (password: student123)
INSERT INTO users (username, password, email, mobile, role, application_status) VALUES 
('student1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student@example.com', '1234567893', 'student', 'approved');

-- Insert sample pending reviewer application
INSERT INTO users (username, password, email, mobile, role, qualifications, experience, application_status) VALUES 
('pending_reviewer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pending@example.com', '1234567894', 'reviewer', 'MBBS, MD in Medicine', '5 years clinical experience', 'pending');

-- Insert sample textbooks
INSERT INTO textbooks (title, author, subject, description, publication_year, publisher_id) VALUES 
('Introduction to Computer Science', 'Dr. Smith', 'Computer Science', 'Comprehensive guide to programming fundamentals', 2023, 3),
('Advanced Mathematics', 'Prof. Johnson', 'Mathematics', 'Higher level mathematical concepts and applications', 2022, 3),
('Physics Principles', 'Dr. Brown', 'Physics', 'Core principles of physics with practical examples', 2024, 3);

-- Insert sample reviews
INSERT INTO reviews (textbook_id, reviewer_id, reviewer_name, rating, accuracy, clarity, relevance, references_quality, comments) VALUES 
(1, 2, 'reviewer1', 4, 5, 4, 5, 4, 'Excellent introduction to computer science concepts. Well structured and easy to follow.'),
(2, 2, 'reviewer1', 5, 5, 5, 5, 5, 'Outstanding mathematical content with clear explanations and good examples.');