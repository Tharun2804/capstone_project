const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'textbook_review_system'
});

async function createAdmin() {
    try {
        const password = await bcrypt.hash('Admin@123', 10);
        
        const sql = `INSERT INTO users (username, email, password, role, mobile_number, application_status) 
                     VALUES ('newadmin', 'newadmin@textbookqa.com', ?, 'admin', '9999999999', 'approved')`;
        
        connection.execute(sql, [password], (err, results) => {
            if (err) {
                console.log('Error:', err.message);
            } else {
                console.log('✅ Admin created successfully!');
                console.log('Username: newadmin');
                console.log('Password: Admin@123');
            }
            connection.end();
        });
    } catch (error) {
        console.log('Error:', error.message);
        connection.end();
    }
}

createAdmin();