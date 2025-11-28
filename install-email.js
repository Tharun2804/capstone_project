// Install nodemailer for email notifications
// Run: npm install nodemailer

const { execSync } = require('child_process');

try {
    console.log('Installing nodemailer...');
    execSync('npm install nodemailer', { stdio: 'inherit' });
    console.log('✅ Nodemailer installed successfully!');
} catch (error) {
    console.error('❌ Installation failed:', error.message);
}