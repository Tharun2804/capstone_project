import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ReviewerDashboard = () => {
  const [assignedBooks, setAssignedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [reviewData, setReviewData] = useState({
    rating: '',
    accuracy: '',
    clarity: '',
    relevance: '',
    references_quality: '',
    comments: ''
  });
  const [message, setMessage] = useState('');
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchAssignedBooks();
  }, []);

  const fetchAssignedBooks = async () => {
    try {
      const response = await fetch('/assignments/my-books', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      setAssignedBooks(data);
    } catch (error) {
      setMessage('Failed to fetch assigned books');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          textbook_id: selectedBook,
          reviewer_name: 'Reviewer',
          ...reviewData
        })
      });
      
      if (response.ok) {
        setMessage('Review submitted successfully!');
        setReviewData({
          rating: '',
          accuracy: '',
          clarity: '',
          relevance: '',
          references_quality: '',
          comments: ''
        });
        setSelectedBook('');
      } else {
        setMessage('Failed to submit review');
      }
    } catch (error) {
      setMessage('Error submitting review');
    }
  };

  const handleInputChange = (field, value) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const handleDownload = (book) => {
    if (book.file_path) {
      const link = document.createElement('a');
      link.href = `/${book.file_path}`;
      link.download = `${book.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setMessage('File not available for download');
    }
  };

  return (
    <div className="dashboard">
      <header style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{margin: 0, fontSize: '28px', fontWeight: 'bold'}}>📝 Reviewer Dashboard</h1>
        <nav>
          <button 
            onClick={logout}
            style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'}}
          >
            🚪 Logout
          </button>
        </nav>
      </header>
      <main>
        {message && <div className="status-message" style={{background: '#3498db', color: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center'}}>{message}</div>}
        
        <section style={{border: '2px solid #e67e22', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#fdf2e9'}}>
          <h2 style={{color: '#d35400', borderBottom: '2px solid #e67e22', paddingBottom: '10px'}}>📚 My Assigned Books ({assignedBooks.length})</h2>
          {assignedBooks.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No books assigned yet. Please contact admin for assignments.</p>
            </div>
          ) : (
            <div>
              {assignedBooks.map(book => (
                <div key={book.id} style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  margin: '15px 0',
                  borderRadius: '8px',
                  background: 'white',
                  borderLeft: '5px solid #e67e22'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <h4 style={{margin: '0 0 10px 0', color: '#2c3e50', fontSize: '18px'}}>{book.title || `Book ${book.id}`}</h4>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '14px', color: '#666'}}>
                        <div><strong>Author:</strong> {book.author}</div>
                        <div><strong>Year:</strong> {book.publication_year}</div>
                        <div><strong>ID:</strong> #{book.id}</div>
                      </div>
                      {book.description && (
                        <div style={{marginTop: '10px', fontSize: '14px', color: '#555'}}>
                          <strong>Description:</strong> {book.description}
                        </div>
                      )}
                    </div>
                    {book.file_path && (
                      <button 
                        onClick={() => handleDownload(book)}
                        style={{background: '#3498db', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', marginLeft: '20px'}}
                      >
                        📥 Download PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{border: '2px solid #e67e22', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#fdf2e9'}}>
          <h2 style={{color: '#d35400', borderBottom: '2px solid #e67e22', paddingBottom: '10px'}}>✍️ Submit Review</h2>
          <form onSubmit={handleReviewSubmit} style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>📖 Select Book to Review:</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', background: 'white'}}
                required
              >
                <option value="">Choose a book to review...</option>
                {assignedBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title || `Book ${book.id}`} - {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>⭐ Rating Criteria (1-5 scale):</label>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="⭐ Overall Rating (1-5)"
                  value={reviewData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />

                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="🎯 Accuracy (1-5)"
                  value={reviewData.accuracy}
                  onChange={(e) => handleInputChange('accuracy', e.target.value)}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />

                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="💡 Clarity (1-5)"
                  value={reviewData.clarity}
                  onChange={(e) => handleInputChange('clarity', e.target.value)}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />

                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="🔗 Relevance (1-5)"
                  value={reviewData.relevance}
                  onChange={(e) => handleInputChange('relevance', e.target.value)}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />

                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="📚 References Quality (1-5)"
                  value={reviewData.references_quality}
                  onChange={(e) => handleInputChange('references_quality', e.target.value)}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />
              </div>
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>💬 Detailed Comments:</label>
              <textarea
                placeholder="Provide your detailed review comments, feedback, and suggestions for improvement..."
                value={reviewData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows="6"
                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box'}}
              />
            </div>

            <button 
              type="submit" 
              style={{background: '#e67e22', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              🚀 Submit Review
            </button>
          </form>
          
          <div style={{marginTop: '15px', padding: '10px', background: '#e8f4fd', borderRadius: '5px', fontSize: '14px', color: '#2980b9'}}>
            💡 <strong>Tip:</strong> Provide constructive feedback to help improve the textbook quality.
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReviewerDashboard;