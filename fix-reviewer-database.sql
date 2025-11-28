-- Fix database for reviewer functionality
USE capstone_db;

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS educational_qualification VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience INT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_designation VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_institution VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS publications TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewer_type VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS proof_documents VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Update existing admin user to have approved status
UPDATE users SET application_status = 'approved' WHERE role = 'admin';

-- Insert sample reviewer applications for testing
INSERT IGNORE INTO users (username, password, role, email, mobile_number, educational_qualification, 
                         specialization, years_experience, current_designation, current_institution, 
                         reviewer_type, application_status) VALUES 
('test_reviewer_1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'reviewer1@example.com', '9876543210', 'PhD in Computer Science', 'Machine Learning', 
 8, 'Associate Professor', 'Tech University', 'subject-wise', 'pending'),
 
('test_reviewer_2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'reviewer2@example.com', '9876543211', 'MBBS, MD', 'Ayurvedic Medicine', 
 12, 'Senior Doctor', 'Ayurveda Hospital', 'general', 'pending'),
 
('approved_reviewer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'approved@example.com', '9876543212', 'MSc Biology', 'Biotechnology', 
 5, 'Research Scientist', 'Research Institute', 'subject-wise', 'approved');

-- Ensure assignments table exists with correct structure
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    textbook_id INT,
    reviewer_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT 'Database setup completed successfully!' as status;