const bcrypt = require('bcrypt');
const db = require('./db');

async function createAdmin() {
    const adminData = {
        username: 'admin',
        email: 'admin@textbookqa.com',
        password: 'Admin@123', // Change this to a secure password
        role: 'admin',
        mobileNumber: '9999999999'
    };

    try {
        // Check if admin already exists
        db.query("SELECT * FROM users WHERE role = 'admin'", async (err, results) => {
            if (err) {
                console.error('❌ Database error:', err.message);
                return;
            }

            if (results.length > 0) {
                console.log('⚠️ Admin user already exists!');
                console.log('Existing admin:', results[0].username);
                return;
            }

            // Create new admin
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            
            const sql = `INSERT INTO users (username, email, password, role, mobile_number, application_status, created_at) 
                         VALUES (?, ?, ?, ?, ?, 'approved', NOW())`;
            
            db.query(sql, [
                adminData.username, 
                adminData.email, 
                hashedPassword, 
                adminData.role, 
                adminData.mobileNumber
            ], (err, result) => {
                if (err) {
                    console.error('❌ Admin creation error:', err.message);
                    return;
                }
                
                console.log('✅ Admin user created successfully!');
                console.log('📧 Email:', adminData.email);
                console.log('👤 Username:', adminData.username);
                console.log('🔑 Password:', adminData.password);
                console.log('⚠️ Please change the password after first login!');
                
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

// Run the script
createAdmin();