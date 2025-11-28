const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'textbook_review_system'
});

function deleteExistingAdmin() {
    console.log('⚠️ WARNING: This will delete ALL admin users!');
    console.log('🔄 Deleting existing admin users...\n');
    
    const sql = "DELETE FROM users WHERE role = 'admin'";
    
    connection.execute(sql, (err, results) => {
        if (err) {
            console.log('❌ Error:', err.message);
            connection.end();
            return;
        }

        console.log(`✅ Deleted ${results.affectedRows} admin user(s)`);
        console.log('💡 Now you can create a new admin with username "admin"');
        
        connection.end();
    });
}

// Uncomment the line below to run the deletion
// deleteExistingAdmin();

console.log('⚠️ SAFETY CHECK: This script is disabled by default');
console.log('📝 To delete existing admin users:');
console.log('   1. Open delete-admin.js file');
console.log('   2. Uncomment the last line: deleteExistingAdmin();');
console.log('   3. Run: node delete-admin.js');
console.log('   4. Then create new admin with username "admin"');