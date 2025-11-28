import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const StudentDashboard = () => {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');
  const { logout } = useAuth();
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
      setMessage('Failed to fetch books');
      console.error('Error:', error);
    }
  };

  const handleBookSelect = (book) => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="dashboard">
      <header>
        <h1>🎓 Student Dashboard</h1>
        <nav>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {message && <div className="status-message error">{message}</div>}
        
        <style>{`
          .books-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            padding: 20px 0;
          }
          .book-card {
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 15px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s;
          }
          .book-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .book-cover {
            position: relative;
            height: 200px;
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
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
            border-radius: 8px;
          }
          .cover-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            border-radius: 8px;
          }
          .cover-placeholder small {
            margin-top: 10px;
            font-size: 12px;
            text-align: center;
            opacity: 0.8;
          }
          .book-info h3 {
            margin: 0 0 8px 0;
            color: #2c3e50;
            font-size: 16px;
          }
          .author {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .view-details-btn {
            width: 100%;
            padding: 10px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
          }
          .view-details-btn:hover {
            background: #2980b9;
          }
        `}</style>
        
        <section>
          <h2>Available Textbooks</h2>
          {books.length === 0 ? (
            <p>Loading books...</p>
          ) : (
            <div className="books-grid">
              {books.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-cover">
                    <div className={`status-badge ${book.status || 'published'}`}>
                      {book.status === 'published' ? 'Published' : 'Review Pending'}
                    </div>
                    {book.cover_image ? (
                      <img 
                        src={`/uploads/${book.cover_image}`} 
                        alt={`${book.title} Cover`} 
                        className="cover-image"
                        onLoad={(e) => {
                          console.log('✅ Image loaded:', e.target.src);
                          e.target.nextSibling.style.display = 'none';
                        }}
                        onError={(e) => {
                          console.log('❌ Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="cover-placeholder" style={{display: 'flex'}}>
                      <span>📚</span>
                      <small>{book.title}</small>
                    </div>
                  </div>
                  
                  <div className="book-info">
                    <h3>{book.title || `Book ${book.id}`}</h3>
                    <p className="author">by {book.author || 'Unknown'}</p>
                    <span className="subject-tag">{book.subject || 'General'}</span>
                    
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
                        <span>📝 {book.review_count || 0} reviews</span>
                      </div>
                    </div>
                    
                    <button onClick={() => handleBookSelect(book)} className="view-details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;