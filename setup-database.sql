-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS capstone_db;
USE capstone_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'reviewer', 'publisher', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create textbooks table
CREATE TABLE IF NOT EXISTS textbooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    publication_year INT,
    description TEXT,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    textbook_id INT,
    reviewer_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT IGNORE INTO users (username, password, role) VALUES 
('admin', '$2b$10$example.hash.for.admin', 'admin'),
('reviewer1', '$2b$10$example.hash.for.reviewer', 'reviewer'),
('publisher1', '$2b$10$example.hash.for.publisher', 'publisher'),
('student1', '$2b$10$example.hash.for.student', 'student');