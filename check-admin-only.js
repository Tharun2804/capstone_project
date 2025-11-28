const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'textbook_review_system'
});

function checkAdminUsers() {
    console.log('🔍 Checking admin users specifically...\n');
    
    const sql = "SELECT id, username, email, role, application_status FROM users WHERE role = 'admin' OR username LIKE '%admin%'";
    
    connection.execute(sql, (err, results) => {
        if (err) {
            console.log('❌ Error:', err.message);
            connection.end();
            return;
        }

        console.log('👑 ADMIN USERS FOUND:');
        console.log('='.repeat(50));
        
        if (results.length === 0) {
            console.log('❌ No admin users found!');
            console.log('💡 You can use "admin" as username');
        } else {
            results.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}`);
                console.log(`   Username: ${user.username} ⚠️ (TAKEN)`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Status: ${user.application_status}`);
                console.log('');
            });
            
            console.log('💡 AVAILABLE USERNAMES YOU CAN USE:');
            console.log('   - superadmin');
            console.log('   - admin2');
            console.log('   - myadmin');
            console.log('   - administrator');
            console.log('   - root_admin');
        }
        
        connection.end();
    });
}

checkAdminUsers();