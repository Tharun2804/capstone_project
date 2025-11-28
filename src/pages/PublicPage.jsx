import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PublicPage = () => {
  const [books, setBooks] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Failed to fetch books');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="public-page">
      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #f5f7fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .public-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .logo {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .nav-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-btn:hover, .nav-btn.active {
          background: rgba(255,255,255,0.3);
          border-color: white;
          transform: translateY(-1px);
        }
        
        .login-btn {
          background: rgba(255,255,255,0.9);
          color: #667eea;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        
        .main-content {
          padding: 20px;
        }
        
        .hero-section {
          border: 2px solid #667eea;
          padding: 40px;
          margin: 20px 0;
          border-radius: 15px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .hero-title {
          color: #2c3e50;
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .hero-subtitle {
          color: #6c757d;
          font-size: 18px;
          line-height: 1.6;
        }
        
        .about-section {
          border: 2px solid #27ae60;
          padding: 20px;
          margin: 20px 0;
          border-radius: 15px;
          background: #f8f9fa;
        }
        
        .about-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .about-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          border: 1px solid #ddd;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .about-card h3 {
          color: #27ae60;
          font-size: 18px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        
        .about-card p {
          color: #555;
          line-height: 1.5;
          font-size: 14px;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          background: white;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stat-item {
          text-align: center;
          padding: 15px;
        }
        
        .stat-item h4 {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 8px;
        }
        
        .stat-item p {
          color: #666;
          font-weight: 500;
          font-size: 14px;
        }
        
        .textbooks-section {
          border: 2px solid #3498db;
          padding: 20px;
          margin: 20px 0;
          border-radius: 15px;
          background: #f8f9fa;
        }
        
        .section-title {
          color: #2980b9;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 25px;
        }
        
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .book-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          transition: all 0.3s ease;
          border-left: 4px solid #3498db;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .book-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .book-cover {
          height: 160px;
          margin-bottom: 15px;
          border-radius: 6px;
          overflow: hidden;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          position: relative;
        }
        
        .status-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          z-index: 10;
        }
        
        .status-badge.published {
          background: #27ae60;
          color: white;
        }
        
        .status-badge.review-pending {
          background: #e67e22;
          color: white;
        }
        
        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .cover-placeholder {
          width: 100%;
          height: 100%;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          font-size: 20px;
          border: 2px dashed #dee2e6;
        }
        
        .cover-placeholder small {
          margin-top: 8px;
          font-size: 12px;
          text-align: center;
          font-weight: 500;
        }
        
        .book-info h3 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
        }
        
        .author {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 12px;
          font-weight: 500;
        }
        
        .book-description {
          font-size: 14px;
          color: #495057;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .book-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f1f3f4;
        }
        
        .rating {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .stars {
          color: #ffc107;
          font-size: 14px;
        }
        
        .rating-score {
          font-size: 13px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .stats {
          font-size: 13px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .login-prompt {
          background: #e8f4fd;
          border: 1px solid #3498db;
          padding: 25px;
          border-radius: 10px;
          text-align: center;
          margin-top: 20px;
        }
        
        .login-prompt h3 {
          color: #2980b9;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .login-prompt p {
          color: #2980b9;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .login-prompt a {
          color: #3498db;
          text-decoration: none;
          font-weight: bold;
        }
        
        .login-prompt a:hover {
          text-decoration: underline;
        }
        
        .contact-section {
          border: 2px solid #9b59b6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 15px;
          background: #f8f9fa;
        }
        
        .contact-title {
          color: #8e44ad;
          border-bottom: 2px solid #9b59b6;
          padding-bottom: 10px;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 25px;
        }
        
        .contact-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 20px;
        }
        
        .contact-info {
          background: white;
          padding: 25px;
          border-radius: 10px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .contact-info h3 {
          color: #8e44ad;
          font-size: 20px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        .contact-item {
          margin-bottom: 15px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f1f1;
        }
        
        .contact-item strong {
          color: #2c3e50;
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        .contact-item p {
          color: #666;
          margin: 0;
          font-size: 14px;
        }
        
        .contact-form {
          background: white;
          padding: 25px;
          border-radius: 10px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .contact-form h3 {
          color: #8e44ad;
          font-size: 20px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        .contact-form input,
        .contact-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          margin-bottom: 15px;
          box-sizing: border-box;
        }
        
        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: none;
          border-color: #9b59b6;
        }
        
        .contact-form button {
          background: #9b59b6;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
        }
        
        .contact-form button:hover {
          background: #8e44ad;
        }
        
        @media (max-width: 768px) {
          .public-header {
            margin: 10px;
            padding: 15px;
            flex-direction: column;
            gap: 15px;
          }
          
          .nav-links {
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .main-content {
            padding: 10px;
          }
          
          .about-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-section {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .contact-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .books-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <div className="dashboard">
        <header className="public-header">
          <h1 className="logo" onClick={() => setActiveSection('home')}>🏠 TextbookQA</h1>
          <nav className="nav-links">
            <button 
              className={`nav-btn ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveSection('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-btn ${activeSection === 'textbooks' ? 'active' : ''}`}
              onClick={() => setActiveSection('textbooks')}
            >
              📚 Textbooks
            </button>
            <button 
              className={`nav-btn ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveSection('contact')}
            >
              📞 Contact
            </button>
            <Link to="/login" className="login-btn">🔐 Login</Link>
          </nav>
        </header>
      
      <main className="main-content">
        {activeSection === 'home' && (
          <section className="home-section">
            <div className="hero-section">
              <h1 className="hero-title">Welcome to TextbookQA</h1>
              <p className="hero-subtitle">Your Premier Platform for Educational Content Quality Assurance</p>
            </div>
            
            <div className="about-section">
              <div className="about-grid">
                <div className="about-card">
                  <h3>🎯 Our Mission</h3>
                  <p>To ensure the highest quality of educational textbooks through comprehensive peer review and collaborative assessment by qualified experts.</p>
                </div>
                <div className="about-card">
                  <h3>👥 For Everyone</h3>
                  <p>Students access quality content, Publishers get expert feedback, Reviewers contribute expertise, and Administrators maintain standards.</p>
                </div>
                <div className="about-card">
                  <h3>🔍 Quality Assurance</h3>
                  <p>Advanced plagiarism detection, expert reviewer network, and comprehensive evaluation criteria ensure educational excellence.</p>
                </div>
              </div>
              
              <div className="stats-section">
                <div className="stat-item">
                  <h4>{books.length}</h4>
                  <p>Textbooks Available</p>
                </div>
                <div className="stat-item">
                  <h4>50+</h4>
                  <p>Expert Reviewers</p>
                </div>
                <div className="stat-item">
                  <h4>1000+</h4>
                  <p>Students Served</p>
                </div>
                <div className="stat-item">
                  <h4>95%</h4>
                  <p>Quality Rating</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'textbooks' && (
          <section className="textbooks-section">
            <h2 className="section-title">📖 Available Textbooks ({books.length})</h2>
            <div className="books-grid">
              {books.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-cover">
                    <div className={`status-badge ${book.status}`}>
                      {book.status === 'published' ? 'Published' : 'Review Pending'}
                    </div>
                    {book.cover_image ? (
                      <img src={`/uploads/${book.cover_image}`} alt="Cover" className="cover-image" />
                    ) : (
                      <div className="cover-placeholder">
                        <span>📚</span>
                        <small>{book.title}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="book-info">
                    <h3>{book.title || `Book ${book.id}`}</h3>
                    <p className="author">by {book.author}</p>
                    <div className="book-description">{book.description}</div>
                    
                    <div className="book-stats">
                      <div className="rating">
                        <span className="stars">
                          {book.avg_rating ? 
                            '⭐'.repeat(Math.round(book.avg_rating)) + '☆'.repeat(5 - Math.round(book.avg_rating))
                            : 'No ratings yet'
                          }
                        </span>
                        <span className="rating-score">
                          {book.avg_rating ? `(${parseFloat(book.avg_rating).toFixed(1)})` : '(0.0)'}
                        </span>
                      </div>
                      <div className="stats">
                        <span>📅 {book.publication_year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="login-prompt">
              <h3>🔑 Access Full Content</h3>
              <p><Link to="/login">Sign in</Link> to read complete textbooks and submit reviews, or <Link to="/register">create an account</Link> to get started!</p>
            </div>
          </section>
        )}
        
        {activeSection === 'contact' && (
          <section className="contact-section">
            <h2 className="contact-title">📞 Contact Us</h2>
            <div className="contact-container">
              <div className="contact-info">
                <h3>Get in Touch</h3>
                <div className="contact-item">
                  <strong>📧 Email:</strong>
                  <p>support@textbookqa.com</p>
                </div>
                <div className="contact-item">
                  <strong>📞 Phone:</strong>
                  <p>+91 8247364731</p>
                </div>
                <div className="contact-item">
                  <strong>📍 Address:</strong>
                  <p>Presidency University<br/>Bangalore, Karnataka, India</p>
                </div>
                <div className="contact-item">
                  <strong>🕒 Office Hours:</strong>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <h3>Send us a Message</h3>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                />
                <button type="submit">Send Message</button>
              </form>
            </div>
          </section>
        )}
      </main>
      </div>
    </div>
  );
};

export default PublicPage;