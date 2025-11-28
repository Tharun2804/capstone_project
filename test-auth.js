const bcrypt = require('bcrypt');
const db = require('./db');

async function testAuth() {
    console.log('🧪 Testing authentication...');
    
    // Test 1: Check if we can connect to database
    console.log('\n1. Testing database connection...');
    
    // Test 2: Create a test user
    console.log('\n2. Creating test user...');
    try {
        const hashedPassword = await bcrypt.hash('test123', 10);
        const sql = "INSERT INTO users (username, email, password, role, application_status) VALUES (?, ?, ?, ?, ?)";
        
        db.query(sql, ['testuser', 'test@example.com', hashedPassword, 'student', 'approved'], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log('✅ User already exists (this is fine)');
                } else {
                    console.log('❌ Error creating user:', err.message);
                }
            } else {
                console.log('✅ Test user created successfully');
            }
            
            // Test 3: Try to login with test user
            console.log('\n3. Testing login...');
            db.query("SELECT * FROM users WHERE username = ?", ['testuser'], async (err, results) => {
                if (err) {
                    console.log('❌ Error fetching user:', err.message);
                } else if (results.length === 0) {
                    console.log('❌ User not found');
                } else {
                    const user = results[0];
                    const match = await bcrypt.compare('test123', user.password);
                    if (match) {
                        console.log('✅ Login test successful');
                    } else {
                        console.log('❌ Password verification failed');
                    }
                }
                
                // Test 4: Check database structure
                console.log('\n4. Checking database structure...');
                db.query("DESCRIBE users", (err, results) => {
                    if (err) {
                        console.log('❌ Error checking table structure:', err.message);
                    } else {
                        console.log('✅ Users table structure:');
                        results.forEach(col => {
                            console.log(`   - ${col.Field}: ${col.Type}`);
                        });
                    }
                    
                    console.log('\n🎉 Authentication test completed!');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.log('❌ Error in test:', error.message);
        process.exit(1);
    }
}

testAuth();