require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./db");
const multer = require("multer");
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key_from_previous_step";

// CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Auth middleware
const authenticateToken = (role) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        if (role && user.role !== role) return res.status(403).json({ message: "Access denied" });
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/login", async (req, res) => {
    console.log('🔐 Login request:', req.body);
    const { username, password } = req.body;
    
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.log('❌ Login DB error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            console.log('❌ User not found:', username);
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('❌ Password mismatch for:', username);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check application status for non-admin users
        if (user.role !== 'admin' && user.application_status !== 'approved') {
            console.log('❌ Account not approved:', username);
            return res.status(403).json({ 
                message: `Your ${user.role} application is ${user.application_status}. Please wait for admin approval.` 
            });
        }

        console.log('✅ Login successful for:', username);
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    });
});

app.get("/books", (req, res) => {
    const sql = `
        SELECT t.*, COUNT(r.id) as review_count, AVG(r.rating) as avg_rating
        FROM textbooks t
        LEFT JOIN reviews r ON t.id = r.textbook_id
        GROUP BY t.id
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Process cover image paths and add status
        const processedResults = results.map(book => ({
            ...book,
            cover_image: book.cover_image ? 
                book.cover_image.replace(/^uploads[\\/]/, '').replace(/^uploads/, '') : null,
            status: book.review_count > 0 ? 'published' : 'review-pending'
        }));
        
        res.json(processedResults);
    });
});

app.get("/books/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM textbooks WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Book not found" });
        res.json(results[0]);
    });
});

// Route to read book online (for students and reviewers)
app.get("/books/:id/read", (req, res) => {
    const { id } = req.params;
    const token = req.query.token;
    
    if (!token) {
        return res.status(401).send('<h1>Unauthorized</h1><p>Please login to read this book.</p>');
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send('<h1>Forbidden</h1><p>Invalid token. Please login again.</p>');
        }
        
        if (!['student', 'reviewer'].includes(user.role)) {
            return res.status(403).send('<h1>Access Denied</h1><p>Only students and reviewers can read books.</p>');
        }
        
        db.query("SELECT file_path, title FROM textbooks WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).send('<h1>Server Error</h1>');
            if (results.length === 0) return res.status(404).send('<h1>Book Not Found</h1>');
            
            const book = results[0];
            if (!book.file_path) {
                return res.status(404).send('<h1>File Not Available</h1>');
            }
            
            const fs = require('fs');
            let filePath = book.file_path;
            
            if (!path.isAbsolute(filePath)) {
                filePath = path.join(__dirname, filePath);
            }
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).send('<h1>File Not Found</h1><p>The book file is not available.</p>');
            }
            
            const fileExtension = path.extname(filePath).toLowerCase();
            
            const viewerHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${book.title} - Online Reader</title>
                <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .header { background: #2c3e50; color: white; padding: 15px; text-align: center; }
                    .viewer { width: 100%; height: calc(100vh - 80px); }
                    iframe { width: 100%; height: 100%; border: none; }
                    .text-content { padding: 20px; white-space: pre-wrap; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${book.title}</h1>
                    <p>Online Reader - View Only</p>
                </div>
                <div class="viewer">`;
            
            if (fileExtension === '.pdf') {
                const pdfViewer = viewerHtml + `
                    <object data="/books/${id}/file?token=${token}" type="application/pdf" width="100%" height="100%">
                        <embed src="/books/${id}/file?token=${token}" type="application/pdf" width="100%" height="100%" />
                        <p>Your browser does not support PDF viewing. Please use a modern browser with PDF support.</p>
                    </object>
                </div>
                <script>
                    // Disable right-click and keyboard shortcuts
                    document.addEventListener('contextmenu', e => e.preventDefault());
                    document.addEventListener('keydown', function(e) {
                        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
                            e.preventDefault();
                        }
                    });
                </script>
                </body></html>`;
                return res.send(pdfViewer);
            } else if (fileExtension === '.txt') {
                try {
                    const textContent = fs.readFileSync(filePath, 'utf8');
                    const textViewer = viewerHtml + `
                        <div class="text-content">${textContent}</div>
                    </div></body></html>`;
                    return res.send(textViewer);
                } catch (error) {
                    return res.status(500).send('<h1>Error reading file</h1>');
                }
            } else {
                const unsupported = viewerHtml + `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Unsupported File Type</h2>
                        <p>This file type (${fileExtension}) cannot be viewed online.</p>
                    </div>
                </div></body></html>`;
                return res.send(unsupported);
            }
        });
    });
});

// Route to serve PDF files for embedding
app.get("/books/:id/file", (req, res) => {
    const { id } = req.params;
    const token = req.query.token;
    
    if (!token) return res.status(401).send('Unauthorized');
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err || !['student', 'reviewer'].includes(user.role)) {
            return res.status(403).send('Forbidden');
        }
        
        db.query("SELECT file_path FROM textbooks WHERE id = ?", [id], (err, results) => {
            if (err || results.length === 0) return res.status(404).send('File not found');
            
            let filePath = results[0].file_path;
            if (!path.isAbsolute(filePath)) {
                filePath = path.join(__dirname, filePath);
            }
            
            const fs = require('fs');
            if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('Content-Security-Policy', 'frame-ancestors \'self\'');
            
            // Stream the file instead of using sendFile to have more control
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        });
    });
});

app.post("/register", upload.fields([{name: 'proofDocuments'}, {name: 'idCard'}]), async (req, res) => {
    console.log('📝 Registration request received:', req.body);
    
    const { username, email, password, role, mobileNumber, educationalQualification, 
            specialization, yearsExperience, currentDesignation, currentInstitution, 
            publications, reviewerType, studentId, institution, course, yearOfStudy } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ error: "Username, password, and role are required" });
    }
    
    // Security: Prevent admin role registration
    if (role === 'admin') {
        return res.status(403).json({ error: "Admin accounts cannot be created through registration. Contact system administrator." });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const idCardPath = req.files?.idCard?.[0]?.path || null;
        
        if (role === 'reviewer') {
            const sql = `INSERT INTO users (username, email, password, role, mobile_number, 
                        educational_qualification, specialization, years_experience, 
                        current_designation, current_institution, publications, reviewer_type, 
                        application_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;
            
            db.query(sql, [username, email, hashedPassword, role, mobileNumber, 
                          educationalQualification, specialization, yearsExperience, 
                          currentDesignation, currentInstitution, publications, reviewerType], 
                    (err, result) => {
                if (err) {
                    console.log('❌ Reviewer registration error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                console.log('✅ Reviewer registered successfully');
                res.json({ message: "Reviewer application submitted successfully. Please wait for admin approval." });
            });
        } else if (role === 'student') {
            const sql = `INSERT INTO users (username, email, password, role, mobile_number, 
                        student_id, institution, course, year_of_study, id_card_path, 
                        application_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;
            
            db.query(sql, [username, email, hashedPassword, role, mobileNumber, 
                          studentId, institution, course, yearOfStudy, idCardPath], 
                    (err, result) => {
                if (err) {
                    console.log('❌ Student registration error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                console.log('✅ Student registered successfully');
                res.json({ message: "Student application submitted successfully. Please wait for admin approval." });
            });
        } else {
            const sql = "INSERT INTO users (username, email, password, role, mobile_number, application_status) VALUES (?, ?, ?, ?, ?, 'approved')";
            db.query(sql, [username, email, hashedPassword, role, mobileNumber], (err, result) => {
                if (err) {
                    console.log('❌ User registration error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                console.log('✅ User registered successfully');
                res.json({ message: "User registered successfully" });
            });
        }
    } catch (error) {
        console.log('❌ Registration catch error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Add authentication middleware that allows multiple roles
const authorizeRoles = (roles) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = user;
        next();
    });
};

// Plagiarism check endpoint
app.post("/plagiarism-check", authorizeRoles(['admin', 'publisher']), upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    
    try {
        const { checkPlagiarismDirect } = require('./plagiarism-checker');
        const result = await checkPlagiarismDirect(req.file.path);
        res.json(result);
    } catch (error) {
        console.log('❌ Plagiarism check error:', error.message);
        res.status(500).json({ message: "Error checking plagiarism: " + error.message });
    }
});

app.post("/books", authorizeRoles(['admin', 'publisher']), upload.fields([{name: 'file'}, {name: 'coverImage'}]), (req, res) => {
    const { title, author, publication_year, description } = req.body;
    const file_path = req.files?.file?.[0]?.path || null;
    const cover_image = req.files?.coverImage?.[0]?.path || null;
    
    const sql = "INSERT INTO textbooks (title, author, publication_year, description, file_path, cover_image) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, author, publication_year, description, file_path, cover_image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Book added successfully", id: result.insertId });
    });
});

app.delete("/books/:id", authorizeRoles(['admin', 'publisher']), (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM textbooks WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Book deleted successfully" });
    });
});

app.post("/reviews", authorizeRoles(['reviewer', 'student']), (req, res) => {
    const { textbook_id, rating, comments, accuracy, clarity, relevance, references_quality } = req.body;
    const reviewer_id = req.user.id;
    
    // Get reviewer username
    db.query("SELECT username FROM users WHERE id = ?", [reviewer_id], (err, userResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const reviewer_name = userResult[0]?.username || 'Anonymous Reviewer';
        
        const sql = `INSERT INTO reviews (textbook_id, reviewer_name, rating, comments, accuracy, clarity, relevance, references_quality, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        
        db.query(sql, [textbook_id, reviewer_name, rating, comments, accuracy || rating, clarity || rating, relevance || rating, references_quality || rating], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Review submitted successfully", review_id: result.insertId });
        });
    });
});

app.get("/books/:id/reviews", (req, res) => {
    const { id } = req.params;
    
    // Get review summary
    const summarySql = `
        SELECT 
            AVG(rating) as avg_rating,
            AVG(accuracy) as avg_accuracy,
            AVG(clarity) as avg_clarity,
            AVG(relevance) as avg_relevance,
            AVG(references_quality) as avg_references_quality,
            COUNT(*) as total_reviews
        FROM reviews 
        WHERE textbook_id = ?
    `;
    
    db.query(summarySql, [id], (err, summaryResults) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Get detailed reviews
        const detailSql = "SELECT * FROM reviews WHERE textbook_id = ? ORDER BY created_at DESC";
        db.query(detailSql, [id], (err, detailResults) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                summary: summaryResults[0] || {
                    avg_rating: 0,
                    avg_accuracy: 0,
                    avg_clarity: 0,
                    avg_relevance: 0,
                    avg_references_quality: 0,
                    total_reviews: 0
                },
                detailedReviews: detailResults
            });
        });
    });
});

// Get all reviewers
app.get("/users/reviewers", authenticateToken('admin'), (req, res) => {
    db.query("SELECT id, username FROM users WHERE role = 'reviewer'", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get reviewer applications (only pending)
app.get("/admin/reviewer-applications", authenticateToken('admin'), (req, res) => {
    const sql = `
        SELECT u.id, u.username, u.email, u.mobile_number, u.educational_qualification, 
               u.specialization, u.years_experience, u.reviewer_type, u.current_designation, 
               u.current_institution, u.application_status, u.created_at
        FROM users u 
        WHERE u.application_status = 'pending' AND u.role = 'reviewer'
        ORDER BY u.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get student applications (only pending)
app.get("/admin/student-applications", authenticateToken('admin'), (req, res) => {
    const sql = `
        SELECT u.id, u.username, u.email, u.mobile_number, u.student_id, 
               u.institution, u.course, u.year_of_study, u.id_card_path, 
               u.application_status, u.created_at
        FROM users u 
        WHERE u.application_status = 'pending' AND u.role = 'student'
        ORDER BY u.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get assigned books for reviewer (no duplicates)
app.get("/assignments/my-books", authenticateToken('reviewer'), (req, res) => {
    const reviewerId = req.user.id;
    const sql = `
        SELECT DISTINCT t.id, t.title, t.author, t.publication_year, t.description, t.file_path,
               MAX(a.assigned_at) as assigned_at, MAX(a.id) as assignment_id
        FROM textbooks t
        JOIN assignments a ON t.id = a.textbook_id 
        WHERE a.reviewer_id = ?
        GROUP BY t.id, t.title, t.author, t.publication_year, t.description, t.file_path
        ORDER BY assigned_at DESC
    `;
    db.query(sql, [reviewerId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Approve reviewer application
app.put("/admin/reviewer-applications/:id/approve", authenticateToken('admin'), (req, res) => {
    const { id } = req.params;
    
    // First get user details
    db.query("SELECT username, email FROM users WHERE id = ?", [id], (err, userResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (userResult.length === 0) return res.status(404).json({ message: "User not found" });
        
        const user = userResult[0];
        
        // Update user status
        const sql = "UPDATE users SET application_status = 'approved', role = 'reviewer', approved_at = NOW() WHERE id = ?";
        db.query(sql, [id], async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Application not found" });
            
            // Send approval email
            if (user.email) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: '🎉 Reviewer Application Approved - Textbook Review System',
                        html: `
                            <h2>Congratulations ${user.username}!</h2>
                            <p>Your reviewer application has been <strong>approved</strong>.</p>
                            <p>You can now log in to the system and start reviewing textbooks.</p>
                            <p><a href="http://localhost:5173/login">Login Here</a></p>
                            <p>Thank you for joining our reviewer community!</p>
                        `
                    });
                    console.log('✅ Approval email sent to:', user.email);
                } catch (emailError) {
                    console.log('❌ Email error:', emailError.message);
                }
            }
            
            res.json({ message: "Reviewer approved successfully" });
        });
    });
});

// Reject reviewer application
app.put("/admin/reviewer-applications/:id/reject", authenticateToken('admin'), (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    // First get user details
    db.query("SELECT username, email FROM users WHERE id = ?", [id], (err, userResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (userResult.length === 0) return res.status(404).json({ message: "User not found" });
        
        const user = userResult[0];
        
        const sql = "UPDATE users SET application_status = 'rejected', rejection_reason = ? WHERE id = ?";
        db.query(sql, [rejectionReason, id], async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Send rejection email
            if (user.email) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: 'Reviewer Application Update - Textbook Review System',
                        html: `
                            <h2>Hello ${user.username},</h2>
                            <p>Thank you for your interest in becoming a reviewer.</p>
                            <p>Unfortunately, your reviewer application has been <strong>rejected</strong>.</p>
                            <p><strong>Reason:</strong> ${rejectionReason}</p>
                            <p>You may reapply in the future if you meet the requirements.</p>
                            <p>Thank you for your understanding.</p>
                        `
                    });
                    console.log('✅ Rejection email sent to:', user.email);
                } catch (emailError) {
                    console.log('❌ Email error:', emailError.message);
                }
            }
            
            res.json({ message: "Reviewer rejected successfully" });
        });
    });
});

// Approve student application
app.put("/admin/student-applications/:id/approve", authenticateToken('admin'), (req, res) => {
    const { id } = req.params;
    
    // First get user details
    db.query("SELECT username, email FROM users WHERE id = ?", [id], (err, userResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (userResult.length === 0) return res.status(404).json({ message: "User not found" });
        
        const user = userResult[0];
        
        // Update user status
        const sql = "UPDATE users SET application_status = 'approved', approved_at = NOW() WHERE id = ?";
        db.query(sql, [id], async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Application not found" });
            
            // Send approval email
            if (user.email) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: '🎉 Student Application Approved - Textbook Review System',
                        html: `
                            <h2>Congratulations ${user.username}!</h2>
                            <p>Your student application has been <strong>approved</strong>.</p>
                            <p>You can now log in to the system and access textbooks.</p>
                            <p><a href="http://localhost:5173/login">Login Here</a></p>
                            <p>Welcome to our learning community!</p>
                        `
                    });
                    console.log('✅ Student approval email sent to:', user.email);
                } catch (emailError) {
                    console.log('❌ Email error:', emailError.message);
                }
            }
            
            res.json({ message: "Student approved successfully" });
        });
    });
});

// Reject student application
app.put("/admin/student-applications/:id/reject", authenticateToken('admin'), (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    // First get user details
    db.query("SELECT username, email FROM users WHERE id = ?", [id], (err, userResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (userResult.length === 0) return res.status(404).json({ message: "User not found" });
        
        const user = userResult[0];
        
        const sql = "UPDATE users SET application_status = 'rejected', rejection_reason = ? WHERE id = ?";
        db.query(sql, [rejectionReason, id], async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Send rejection email
            if (user.email) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: 'Student Application Update - Textbook Review System',
                        html: `
                            <h2>Hello ${user.username},</h2>
                            <p>Thank you for your interest in joining our platform.</p>
                            <p>Unfortunately, your student application has been <strong>rejected</strong>.</p>
                            <p><strong>Reason:</strong> ${rejectionReason}</p>
                            <p>You may reapply in the future with valid documentation.</p>
                            <p>Thank you for your understanding.</p>
                        `
                    });
                    console.log('✅ Student rejection email sent to:', user.email);
                } catch (emailError) {
                    console.log('❌ Email error:', emailError.message);
                }
            }
            
            res.json({ message: "Student rejected successfully" });
        });
    });
});

// Update book
app.put("/books/:id", authenticateToken('admin'), (req, res) => {
    const { id } = req.params;
    const { title, author, publication_year, description } = req.body;
    const sql = "UPDATE textbooks SET title = ?, author = ?, publication_year = ?, description = ? WHERE id = ?";
    db.query(sql, [title, author, publication_year, description, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Book updated successfully" });
    });
});

// Assign book to reviewer (prevent duplicates)
app.post("/assignments", authenticateToken('admin'), (req, res) => {
    const { textbook_id, reviewer_id } = req.body;
    
    // Check if already assigned
    const checkSql = "SELECT id FROM assignments WHERE textbook_id = ? AND reviewer_id = ?";
    db.query(checkSql, [textbook_id, reviewer_id], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (existing.length > 0) {
            return res.status(400).json({ message: "Book already assigned to this reviewer" });
        }
        
        const sql = "INSERT INTO assignments (textbook_id, reviewer_id, assigned_at) VALUES (?, ?, NOW())";
        db.query(sql, [textbook_id, reviewer_id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Book assigned successfully", id: result.insertId });
        });
    });
});

// Admin-only endpoint to create new admin users
app.post("/admin/create-admin", authenticateToken('admin'), async (req, res) => {
    const { username, email, password, mobileNumber } = req.body;
    
    console.log('🔑 Admin creation request:', { username, email, mobileNumber });
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
    }
    
    try {
        // Check username separately
        db.query("SELECT username FROM users WHERE username = ?", [username], async (err, usernameCheck) => {
            if (err) {
                console.log('❌ Username check error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (usernameCheck.length > 0) {
                console.log('❌ Username already exists:', username);
                return res.status(400).json({ error: `Username '${username}' is already taken. Try: ${username}2, ${username}_admin, super${username}` });
            }
            
            // Check email separately
            db.query("SELECT email FROM users WHERE email = ?", [email], async (err, emailCheck) => {
                if (err) {
                    console.log('❌ Email check error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                if (emailCheck.length > 0) {
                    console.log('❌ Email already exists:', email);
                    return res.status(400).json({ error: `Email '${email}' is already registered. Use a different email address.` });
                }
                
                // Both username and email are available, create admin
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const sql = `INSERT INTO users (username, email, password, role, mobile_number, application_status, created_at) 
                             VALUES (?, ?, ?, 'admin', ?, 'approved', NOW())`;
                
                db.query(sql, [username, email, hashedPassword, mobileNumber], (err, result) => {
                    if (err) {
                        console.log('❌ Admin creation DB error:', err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    console.log('✅ New admin created successfully:', username, 'by admin ID:', req.user.id);
                    res.json({ message: `Admin user '${username}' created successfully!`, adminId: result.insertId });
                });
            });
        });
    } catch (error) {
        console.log('❌ Admin creation catch error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to check existing users (admin only)
app.get("/admin/debug-users", authenticateToken('admin'), (req, res) => {
    db.query("SELECT id, username, email, role FROM users ORDER BY role, username", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/index.html`);
    console.log(`🔑 To create first admin, run: node create-admin.js`);
});