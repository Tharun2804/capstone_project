const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'textbook_review_system'
});

function checkAllUsers() {
    console.log('🔍 Checking all existing users...\n');
    
    const sql = "SELECT id, username, email, role, application_status, created_at FROM users ORDER BY role, username";
    
    connection.execute(sql, (err, results) => {
        if (err) {
            console.log('❌ Error:', err.message);
            connection.end();
            return;
        }

        if (results.length === 0) {
            console.log('❌ No users found in database');
            connection.end();
            return;
        }

        console.log('📋 ALL EXISTING USERS:');
        console.log('='.repeat(80));
        
        let currentRole = '';
        results.forEach((user, index) => {
            if (user.role !== currentRole) {
                currentRole = user.role;
                console.log(`\n🔸 ${currentRole.toUpperCase()} USERS:`);
                console.log('-'.repeat(40));
            }
            
            console.log(`${index + 1}. Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Status: ${user.application_status || 'N/A'}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
            console.log('');
        });
        
        console.log('💡 To create a new admin, use a DIFFERENT username than the ones listed above.');
        console.log('💡 Try usernames like: superadmin, admin2, myadmin, etc.');
        
        connection.end();
    });
}

checkAllUsers();