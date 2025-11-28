const bcrypt = require('bcrypt');
const db = require('./db');

async function createNewAdmin() {
    // Change these details for the new admin
    const adminData = {
        username: 'superadmin',  // Different username
        email: 'superadmin@textbookqa.com',
        password: 'SuperAdmin@123',
        role: 'admin',
        mobileNumber: '8888888888'
    };

    try {
        // Check if this specific admin already exists
        db.query("SELECT * FROM users WHERE username = ? OR email = ?", [adminData.username, adminData.email], async (err, results) => {
            if (err) {
                console.error('❌ Database error:', err.message);
                return;
            }

            if (results.length > 0) {
                console.log('⚠️ Admin with this username/email already exists!');
                console.log('Existing user:', results[0].username);
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
                
                console.log('✅ New admin user created successfully!');
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

createNewAdmin();