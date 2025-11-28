-- Complete setup with email field
USE capstone_db;

-- Add email field
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;

-- Add test reviewer with email
INSERT IGNORE INTO users (username, email, password, role, mobile_number, educational_qualification, specialization, 
                  years_experience, current_designation, current_institution, publications,
                  reviewer_type, application_status) VALUES 
('email_reviewer', 'test@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 '+1234567890', 'PhD in Medicine', 'Ayurveda', 5, 'Professor', 'Medical College', 
 'Research papers', 'subject-wise', 'pending');

-- Check data
SELECT username, email, mobile_number, application_status FROM users WHERE role = 'reviewer' AND application_status = 'pending';