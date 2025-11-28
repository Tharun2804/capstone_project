-- Complete setup for reviewer system with mobile number
USE capstone_db;

-- Add mobile number field if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15) NULL;

-- Add test reviewer with mobile number
INSERT IGNORE INTO users (username, password, role, mobile_number, educational_qualification, specialization, 
                  years_experience, current_designation, current_institution, publications,
                  reviewer_type, application_status) VALUES 
('mobile_reviewer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 '+1234567890', 'PhD in Ayurveda', 'Traditional Medicine', 8, 'Professor', 'Medical College', 
 'Published 20+ papers', 'subject-wise', 'pending');

-- Check data
SELECT username, mobile_number, application_status FROM users WHERE role = 'reviewer' AND application_status = 'pending';