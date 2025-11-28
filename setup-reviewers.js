const db = require('./db');

const setupQueries = [
    // Add missing columns if they don't exist
    `ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL`,
    `ALTER TABLE users ADD COLUMN mobile_number VARCHAR(15) NULL`,
    `ALTER TABLE users ADD COLUMN educational_qualification VARCHAR(255) NULL`,
    `ALTER TABLE users ADD COLUMN specialization VARCHAR(255) NULL`,
    `ALTER TABLE users ADD COLUMN years_experience INT NULL`,
    `ALTER TABLE users ADD COLUMN current_designation VARCHAR(255) NULL`,
    `ALTER TABLE users ADD COLUMN current_institution VARCHAR(255) NULL`,
    `ALTER TABLE users ADD COLUMN publications TEXT NULL`,
    `ALTER TABLE users ADD COLUMN reviewer_type VARCHAR(100) NULL`,
    `ALTER TABLE users ADD COLUMN proof_documents VARCHAR(500) NULL`,
    `ALTER TABLE users ADD COLUMN application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`,
    `ALTER TABLE users ADD COLUMN approved_by INT NULL`,
    `ALTER TABLE users ADD COLUMN approved_at TIMESTAMP NULL`,
    `ALTER TABLE users ADD COLUMN rejection_reason TEXT NULL`,
    
    // Update existing admin user
    `UPDATE users SET application_status = 'approved' WHERE role = 'admin'`,
    
    // Insert sample reviewer applications
    `INSERT IGNORE INTO users (username, password, role, email, mobile_number, educational_qualification, 
     specialization, years_experience, current_designation, current_institution, 
     reviewer_type, application_status) VALUES 
     ('test_reviewer_1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
      'reviewer1@example.com', '9876543210', 'PhD in Computer Science', 'Machine Learning', 
      8, 'Associate Professor', 'Tech University', 'subject-wise', 'pending')`,
      
    `INSERT IGNORE INTO users (username, password, role, email, mobile_number, educational_qualification, 
     specialization, years_experience, current_designation, current_institution, 
     reviewer_type, application_status) VALUES 
     ('test_reviewer_2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
      'reviewer2@example.com', '9876543211', 'MBBS, MD', 'Ayurvedic Medicine', 
      12, 'Senior Doctor', 'Ayurveda Hospital', 'general', 'pending')`,
      
    `INSERT IGNORE INTO users (username, password, role, email, mobile_number, educational_qualification, 
     specialization, years_experience, current_designation, current_institution, 
     reviewer_type, application_status) VALUES 
     ('approved_reviewer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 
      'approved@example.com', '9876543212', 'MSc Biology', 'Biotechnology', 
      5, 'Research Scientist', 'Research Institute', 'subject-wise', 'approved')`
];

async function setupDatabase() {
    console.log('🔧 Setting up reviewer database...');
    
    for (let i = 0; i < setupQueries.length; i++) {
        try {
            await new Promise((resolve, reject) => {
                db.query(setupQueries[i], (err, result) => {
                    if (err && !err.message.includes('Duplicate column name')) {
                        console.log(`⚠️  Query ${i + 1}: ${err.message}`);
                    } else {
                        console.log(`✅ Query ${i + 1} completed`);
                    }
                    resolve();
                });
            });
        } catch (error) {
            console.log(`❌ Error in query ${i + 1}:`, error.message);
        }
    }
    
    console.log('🎉 Database setup completed!');
    process.exit(0);
}

setupDatabase();