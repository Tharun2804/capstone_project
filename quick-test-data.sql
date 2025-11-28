USE capstone_db;

-- Add test reviewer applications
INSERT IGNORE INTO users (username, password, role, educational_qualification, specialization, 
                  years_experience, current_designation, current_institution, publications,
                  reviewer_type, application_status) VALUES 
('test_reviewer1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'PhD in Medicine', 'Ayurveda', 8, 'Senior Professor', 'Medical University', 
 'Published 20+ research papers', 'subject-wise', 'pending'),
('test_reviewer2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
 'MBBS, MD', 'Unani Medicine', 5, 'Assistant Professor', 'Medical College', 
 'Published 10 research papers', 'general', 'pending');

-- Check if data exists
SELECT username, role, application_status, educational_qualification FROM users WHERE role = 'reviewer';