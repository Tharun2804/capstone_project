const db = require('./db');

// Check how cover images are stored in database
db.query("SELECT id, title, cover_image FROM textbooks WHERE cover_image IS NOT NULL", (err, results) => {
    if (err) {
        console.log('❌ Error:', err.message);
        return;
    }
    
    console.log('📊 Books with cover images:');
    results.forEach(book => {
        console.log(`ID: ${book.id}, Title: ${book.title}`);
        console.log(`Cover path: "${book.cover_image}"`);
        console.log('---');
    });
    
    process.exit(0);
});