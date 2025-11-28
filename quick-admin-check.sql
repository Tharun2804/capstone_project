-- Run this in MySQL Workbench or command line
USE textbook_review_system;

-- Check all admin users
SELECT id, username, email, role, mobile_number, application_status, created_at 
FROM users 
WHERE role = 'admin';

-- If no results, create admin manually:
-- INSERT INTO users (username, email, password, role, mobile_number, application_status, created_at) 
-- VALUES ('admin', 'admin@textbookqa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '9999999999', 'approved', NOW());

-- The password hash above is for: Admin@123