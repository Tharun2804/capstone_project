import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PublisherDashboard = () => {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    publication_year: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState('');
  const { logout, user } = useAuth();

  const handleInputChange = (field, value) => {
    setBookData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handlePlagiarismCheck = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/plagiarism-check', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });
      
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error checking plagiarism');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(bookData).forEach(key => {
      formData.append(key, bookData[key]);
    });
    if (file) {
      formData.append('file', file);
    }
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    try {
      const response = await fetch('/books', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });
      
      if (response.ok) {
        setMessage('Book uploaded successfully!');
        setBookData({
          title: '',
          author: '',
          publication_year: '',
          description: ''
        });
        setFile(null);
        setCoverImage(null);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to upload book');
      }
    } catch (error) {
      setMessage('Error uploading book');
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Publisher Dashboard</h1>
        <nav>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {message && <div className="status-message">{message}</div>}
        
        <section>
          <h2>Upload New Textbook</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={bookData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Author"
              value={bookData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Publication Year"
              value={bookData.publication_year}
              onChange={(e) => handleInputChange('publication_year', e.target.value)}
              required
            />

            <textarea
              placeholder="Description"
              value={bookData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="4"
              required
            />

            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <label htmlFor="coverImage">Cover Image:</label>
            <input
              id="coverImage"
              type="file"
              onChange={handleCoverImageChange}
              accept=".jpg,.jpeg,.png,.gif"
            />

            <div className="button-group">
              <button type="button" onClick={handlePlagiarismCheck}>
                Check Plagiarism
              </button>
              <button type="submit">Upload Book</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default PublisherDashboard;