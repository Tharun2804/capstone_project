-- Complete Database Setup for Reviewer Registration System

-- Create database
CREATE DATABASE IF NOT EXISTS capstone_db;
USE capstone_db;

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS textbooks;
DROP TABLE IF EXISTS users;

-- Create users table with reviewer fields
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'reviewer', 'publisher', 'student') NOT NULL,
    
    -- Reviewer-specific fields
    educational_qualification VARCHAR(255) NULL,
    specialization VARCHAR(255) NULL,
    years_experience INT NULL,
    current_designation VARCHAR(255) NULL,
    current_institution VARCHAR(255) NULL,
    publications TEXT NULL,
    reviewer_type VARCHAR(100) NULL,
    proof_documents VARCHAR(500) NULL,
    application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create textbooks table
CREATE TABLE textbooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    publication_year INT,
    description TEXT,
    file_path VARCHAR(500),
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    textbook_id INT,
    reviewer_name VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    accuracy INT CHECK (accuracy >= 1 AND accuracy <= 5),
    clarity INT CHECK (clarity >= 1 AND clarity <= 5),
    relevance INT CHECK (relevance >= 1 AND relevance <= 5),
    references_quality INT CHECK (references_quality >= 1 AND references_quality <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE
);

-- Create assignments table
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    textbook_id INT,
    reviewer_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, password, role, application_status) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'approved');

-- Insert sample approved reviewer (password: reviewer123)
INSERT INTO users (username, password, role, educational_qualification, specialization, 
                  years_experience, current_designation, current_institution, reviewer_type, 
                  application_status) VALUES 
('reviewer1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'PhD in Ayurveda', 'Ayurvedic Medicine', 10, 'Professor', 'Ayurveda University', 
 'subject-wise', 'approved');

-- Insert sample publisher (password: publisher123)
INSERT INTO users (username, password, role, application_status) VALUES 
('publisher1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'publisher', 'approved');

-- Insert sample student (password: student123)
INSERT INTO users (username, password, role, application_status) VALUES 
('student1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'approved');

-- Insert sample pending reviewer application
INSERT INTO users (username, password, role, educational_qualification, specialization, 
                  years_experience, current_designation, current_institution, publications,
                  reviewer_type, application_status) VALUES 
('pending_reviewer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'MBBS, MD', 'Unani Medicine', 5, 'Assistant Professor', 'Medical College', 
 'Published 15 research papers on traditional medicine', 'general', 'pending');

-- Insert sample textbooks
INSERT INTO textbooks (title, author, publication_year, description) VALUES 
('Fundamentals of Ayurveda', 'Dr. Sharma', 2023, 'Comprehensive guide to Ayurvedic principles'),
('Modern Unani Medicine', 'Dr. Khan', 2022, 'Contemporary approaches to Unani treatment'),
('Siddha System Basics', 'Dr. Raman', 2024, 'Introduction to Siddha medical system');