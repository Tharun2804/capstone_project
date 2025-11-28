-- Fix registration by adding missing fields
USE capstone_db;

-- Add email field if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;

-- Add mobile_number field if not exists  
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15) NULL;

-- Add all reviewer fields if not exist
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

-- Show table structure
DESCRIBE users;