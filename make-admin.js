const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// ✏️ CHANGE THESE DETAILS FOR YOUR NEW ADMIN
const NEW_ADMIN = {
    username: 'myadmin',           // Change this
    email: 'myadmin@gmail.com',    // Change this  
    password: 'MyPassword123',     // Change this
    mobile: '9876543210'           // Change this
};

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'textbook_review_system'
});

async function createCustomAdmin() {
    console.log('🔄 Creating new admin...');
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(NEW_ADMIN.password, 10);
        
        // Insert into database
        const sql = `INSERT INTO users (username, email, password, role, mobile_number, application_status, created_at) 
                     VALUES (?, ?, ?, 'admin', ?, 'approved', NOW())`;
        
        connection.execute(sql, [
            NEW_ADMIN.username, 
            NEW_ADMIN.email, 
            hashedPassword, 
            NEW_ADMIN.mobile
        ], (err, results) => {
            if (err) {
                console.log('❌ Error:', err.message);
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log('⚠️ Username or email already exists!');
                }
            } else {
                console.log('✅ Admin created successfully!');
                console.log('📧 Email:', NEW_ADMIN.email);
                console.log('👤 Username:', NEW_ADMIN.username);
                console.log('🔑 Password:', NEW_ADMIN.password);
                console.log('📱 Mobile:', NEW_ADMIN.mobile);
                console.log('');
                console.log('🎉 You can now login with these credentials!');
            }
            connection.end();
        });
    } catch (error) {
        console.log('❌ Error:', error.message);
        connection.end();
    }
}

createCustomAdmin();