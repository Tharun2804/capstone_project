import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookDetails();
    fetchBookReviews();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/books/${id}`);
      const data = await response.json();
      setBook(data);
    } catch (error) {
      setMessage('Failed to fetch book details');
    }
  };

  const fetchBookReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3000/books/${id}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      setMessage('Failed to fetch reviews');
    }
  };

  const handleReadOnline = () => {
    if (book.file_path) {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login first');
        return;
      }
      window.open(`http://localhost:3000/books/${id}/read?token=${token}`, '_blank');
    } else {
      setMessage('File not available for reading');
    }
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header>
        <h1>📖 Book Details</h1>
        <nav>
          <button onClick={() => navigate('/student')}>Back to Dashboard</button>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {message && <div className="status-message error">{message}</div>}
        
        <section>
          <h2>{book.title}</h2>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Year:</strong> {book.publication_year}</p>
          <p><strong>Description:</strong> {book.description}</p>
          
          {book.file_path && (
            <div className="read-section">
              <button 
                className="read-btn"
                onClick={handleReadOnline}
              >
                📖 Read Online
              </button>
            </div>
          )}
        </section>

        {reviews && (
          <section style={{backgroundColor: '#f0f8ff', border: '2px solid #007bff', padding: '20px', marginTop: '20px'}}>
            <h2 style={{color: '#007bff'}}>📊 Reviews</h2>
            
            <div className="reviews-summary" style={{backgroundColor: '#e8f5e8', padding: '15px', marginBottom: '15px'}}>
              <h3>📈 Review Summary</h3>
              {reviews.summary && reviews.summary.total_reviews > 0 ? (
                <>
                  <p><strong>Average Rating:</strong> {reviews.summary.avg_rating ? Number(reviews.summary.avg_rating).toFixed(1) : 'N/A'}/5 ⭐</p>
                  <p><strong>Total Reviews:</strong> {reviews.summary.total_reviews}</p>
                  <p><strong>Average Accuracy:</strong> {reviews.summary.avg_accuracy ? Number(reviews.summary.avg_accuracy).toFixed(1) : 'N/A'}/5</p>
                  <p><strong>Average Clarity:</strong> {reviews.summary.avg_clarity ? Number(reviews.summary.avg_clarity).toFixed(1) : 'N/A'}/5</p>
                </>
              ) : (
                <p>No reviews yet. Be the first to review this book!</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BookDetails;