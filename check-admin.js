const db = require('./db');

function checkAdminUsers() {
    console.log('🔍 Checking for admin users...');
    
    db.query("SELECT id, username, email, role, mobile_number, created_at FROM users WHERE role = 'admin'", (err, results) => {
        if (err) {
            console.error('❌ Database error:', err.message);
            db.end();
            return;
        }

        if (results.length === 0) {
            console.log('❌ No admin users found in database');
            console.log('💡 Run: node create-admin.js to create one');
            db.end();
            return;
        }

        console.log('📋 Existing Admin Users:');
        console.log('========================');
        results.forEach((admin, index) => {
            console.log(`${index + 1}. ID: ${admin.id}`);
            console.log(`   Username: ${admin.username}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Mobile: ${admin.mobile_number || 'Not set'}`);
            console.log(`   Created: ${admin.created_at}`);
            console.log('   ------------------------');
        });
        
        console.log('\n💡 Default password is usually: Admin@123');
        console.log('🔑 Try logging in with username: admin');
        
        db.end();
        process.exit(0);
    });
}

// Add timeout to prevent hanging
setTimeout(() => {
    console.log('⏰ Script timeout - closing connection');
    process.exit(1);
}, 10000);

checkAdminUsers();