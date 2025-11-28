import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [reviewerApplications, setReviewerApplications] = useState([]);
  const [studentApplications, setStudentApplications] = useState([]);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    publication_year: '',
    description: ''
  });
  const [editingBook, setEditingBook] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    author: '',
    publication_year: '',
    description: ''
  });
  const [assignBookId, setAssignBookId] = useState('');
  const [assignReviewerId, setAssignReviewerId] = useState('');
  const [message, setMessage] = useState('');
  const [newAdminData, setNewAdminData] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: ''
  });
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchBooks();
    fetchReviewers();
    fetchReviewerApplications();
    fetchStudentApplications();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      setMessage('Failed to fetch books');
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/users/reviewers', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      setReviewers(data);
    } catch (error) {
      setMessage('Failed to fetch reviewers');
    }
  };

  const fetchReviewerApplications = async () => {
    try {
      console.log('Fetching reviewer applications with token:', user.token);
      const response = await fetch('/admin/reviewer-applications', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Reviewer applications data:', data);
      setReviewerApplications(data);
    } catch (error) {
      console.error('Failed to fetch reviewer applications:', error);
      setMessage('Error fetching reviewer applications: ' + error.message);
    }
  };

  const fetchStudentApplications = async () => {
    try {
      const response = await fetch('/admin/student-applications', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      setStudentApplications(data);
    } catch (error) {
      console.error('Failed to fetch student applications:', error);
      setMessage('Error fetching student applications: ' + error.message);
    }
  };

  const approveReviewer = async (id) => {
    try {
      setMessage('Approving reviewer and sending email...');
      const response = await fetch(`/admin/reviewer-applications/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        setMessage('✅ Reviewer approved successfully! Email notification sent.');
        fetchReviewerApplications();
        fetchReviewers();
      } else {
        setMessage('❌ Failed to approve reviewer');
      }
    } catch (error) {
      setMessage('❌ Error approving reviewer: ' + error.message);
    }
  };

  const rejectReviewer = async (id) => {
    const reason = prompt('Enter rejection reason:') || 'No reason provided';
    try {
      setMessage('Rejecting reviewer and sending email...');
      const response = await fetch(`/admin/reviewer-applications/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      
      if (response.ok) {
        setMessage('✅ Reviewer rejected. Email notification sent.');
        fetchReviewerApplications();
      } else {
        setMessage('❌ Failed to reject reviewer');
      }
    } catch (error) {
      setMessage('❌ Error rejecting reviewer: ' + error.message);
    }
  };

  const approveStudent = async (id) => {
    try {
      setMessage('Approving student and sending email...');
      const response = await fetch(`/admin/student-applications/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        setMessage('✅ Student approved successfully! Email notification sent.');
        fetchStudentApplications();
      } else {
        setMessage('❌ Failed to approve student');
      }
    } catch (error) {
      setMessage('❌ Error approving student: ' + error.message);
    }
  };

  const rejectStudent = async (id) => {
    const reason = prompt('Enter rejection reason:') || 'No reason provided';
    try {
      setMessage('Rejecting student and sending email...');
      const response = await fetch(`/admin/student-applications/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      
      if (response.ok) {
        setMessage('✅ Student rejected. Email notification sent.');
        fetchStudentApplications();
      } else {
        setMessage('❌ Failed to reject student');
      }
    } catch (error) {
      setMessage('❌ Error rejecting student: ' + error.message);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (response.ok) {
        setMessage('Book added successfully!');
        setBookData({ title: '', author: '', publication_year: '', description: '' });
        fetchBooks();
      } else {
        setMessage('Failed to add book');
      }
    } catch (error) {
      setMessage('Error adding book');
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const response = await fetch(`/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        setMessage('Book deleted successfully!');
        fetchBooks();
      } else {
        setMessage('Failed to delete book');
      }
    } catch (error) {
      setMessage('Error deleting book');
    }
  };

  const startEdit = (book) => {
    setEditingBook(book.id);
    setEditData({
      title: book.title || '',
      author: book.author || '',
      publication_year: book.publication_year || '',
      description: book.description || ''
    });
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/books/${editingBook}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        setMessage('Book updated successfully!');
        setEditingBook(null);
        setEditData({ title: '', author: '', publication_year: '', description: '' });
        fetchBooks();
      } else {
        setMessage('Failed to update book');
      }
    } catch (error) {
      setMessage('Error updating book');
    }
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setEditData({ title: '', author: '', publication_year: '', description: '' });
  };

  const handleAssignBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ textbook_id: assignBookId, reviewer_id: assignReviewerId })
      });
      
      if (response.ok) {
        setMessage('Book assigned successfully!');
        setAssignBookId('');
        setAssignReviewerId('');
      } else {
        setMessage('Failed to assign book');
      }
    } catch (error) {
      setMessage('Error assigning book');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newAdminData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ ' + data.message);
        setNewAdminData({ username: '', email: '', password: '', mobileNumber: '' });
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error creating admin: ' + error.message);
    }
  };

  const debugUsers = async () => {
    try {
      const response = await fetch('/admin/debug-users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const users = await response.json();
      
      let userList = 'EXISTING USERS:\n';
      users.forEach(u => {
        userList += `- ${u.username} (${u.email}) [${u.role}]\n`;
      });
      
      alert(userList);
    } catch (error) {
      setMessage('❌ Error fetching users: ' + error.message);
    }
  };

  return (
    <div className="dashboard">
      <header style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{margin: 0, fontSize: '28px', fontWeight: 'bold'}}>🛠️ Admin Dashboard</h1>
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
        {message && <div className="status-message">{message}</div>}
        
        <section style={{border: '2px solid #e74c3c', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#fdedec'}}>
          <h2 style={{color: '#c0392b', borderBottom: '2px solid #e74c3c', paddingBottom: '10px'}}>🔑 Create New Admin User</h2>
          <form onSubmit={handleCreateAdmin} style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
              <input
                type="text"
                placeholder="👤 Username"
                value={newAdminData.username}
                onChange={(e) => setNewAdminData({...newAdminData, username: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                required
              />
              <input
                type="email"
                placeholder="📧 Email Address"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                required
              />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
              <input
                type="password"
                placeholder="🔒 Password (min 6 chars)"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                minLength="6"
                required
              />
              <input
                type="tel"
                placeholder="📱 Mobile Number"
                value={newAdminData.mobileNumber}
                onChange={(e) => setNewAdminData({...newAdminData, mobileNumber: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                required
              />
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
              <button 
                type="submit" 
                style={{background: '#e74c3c', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                🚀 Create Admin User
              </button>
              <button 
                type="button"
                onClick={debugUsers}
                style={{background: '#f39c12', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                🔍 Debug: Show All Users
              </button>
            </div>
          </form>
          
          <div style={{marginTop: '15px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px', fontSize: '14px', color: '#856404'}}>
            ⚠️ <strong>Security Note:</strong> Only create admin accounts for trusted users. Admin users have full system access including user management, book management, and system configuration.
          </div>
        </section>
        
        <section style={{border: '2px solid #3498db', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#f8f9fa'}}>
          <h2 style={{color: '#2980b9', borderBottom: '2px solid #3498db', paddingBottom: '10px'}}>📋 Reviewer Applications</h2>
          <button onClick={fetchReviewerApplications} style={{background: '#3498db', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', marginBottom: '10px'}}>
            🔄 Refresh Applications
          </button>
          {reviewerApplications.length === 0 ? (
            <div>
              <p>No reviewer applications found.</p>
              <p style={{fontSize: '12px', color: '#666'}}>Check browser console for debug info</p>
            </div>
          ) : (
            <div>
              {reviewerApplications.map(app => (
                <div key={app.id} style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  background: 'white',
                  borderLeft: `5px solid ${app.application_status === 'pending' ? 'orange' : app.application_status === 'approved' ? 'green' : 'red'}`
                }}>
                  <h4>{app.username} 
                    <span style={{
                      background: app.application_status === 'pending' ? 'orange' : app.application_status === 'approved' ? 'green' : 'red',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      marginLeft: '10px'
                    }}>
                      {app.application_status.toUpperCase()}
                    </span>
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px'}}>
                    <div><strong>Mobile:</strong> {app.mobile_number || 'N/A'}</div>
                    <div><strong>Qualification:</strong> {app.educational_qualification || 'N/A'}</div>
                    <div><strong>Specialization:</strong> {app.specialization || 'N/A'}</div>
                    <div><strong>Experience:</strong> {app.years_experience || 0} years</div>
                    <div><strong>Type:</strong> {app.reviewer_type || 'N/A'}</div>
                    <div><strong>Designation:</strong> {app.current_designation || 'N/A'}</div>
                    <div><strong>Institution:</strong> {app.current_institution || 'N/A'}</div>
                  </div>
                  <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
                    <strong>Applied:</strong> {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  {app.application_status === 'pending' && (
                    <div style={{marginTop: '10px'}}>
                      <button 
                        onClick={() => approveReviewer(app.id)}
                        style={{background: '#27ae60', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', marginRight: '5px', cursor: 'pointer'}}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => rejectReviewer(app.id)}
                        style={{background: '#e74c3c', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer'}}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{border: '2px solid #e67e22', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#fdf2e9'}}>
          <h2 style={{color: '#d35400', borderBottom: '2px solid #e67e22', paddingBottom: '10px'}}>🎓 Student Applications</h2>
          <button onClick={fetchStudentApplications} style={{background: '#e67e22', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', marginBottom: '10px'}}>
            🔄 Refresh Applications
          </button>
          {studentApplications.length === 0 ? (
            <p>No student applications found.</p>
          ) : (
            <div>
              {studentApplications.map(app => (
                <div key={app.id} style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  background: 'white',
                  borderLeft: `5px solid ${app.application_status === 'pending' ? 'orange' : app.application_status === 'approved' ? 'green' : 'red'}`
                }}>
                  <h4>{app.username} 
                    <span style={{
                      background: app.application_status === 'pending' ? 'orange' : app.application_status === 'approved' ? 'green' : 'red',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      marginLeft: '10px'
                    }}>
                      {app.application_status.toUpperCase()}
                    </span>
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px'}}>
                    <div><strong>Email:</strong> {app.email || 'N/A'}</div>
                    <div><strong>Mobile:</strong> {app.mobile_number || 'N/A'}</div>
                    <div><strong>Student ID:</strong> {app.student_id || 'N/A'}</div>
                    <div><strong>Institution:</strong> {app.institution || 'N/A'}</div>
                    <div><strong>Course:</strong> {app.course || 'N/A'}</div>
                    <div><strong>Year:</strong> {app.year_of_study || 'N/A'}</div>
                  </div>
                  <div style={{marginTop: '10px'}}>
                    <strong>ID Card:</strong> 
                    {app.id_card_path ? (
                      <a href={`/${app.id_card_path}`} target="_blank" rel="noopener noreferrer" style={{marginLeft: '10px', color: '#3498db'}}>
                        📄 View ID Card
                      </a>
                    ) : (
                      <span style={{marginLeft: '10px', color: '#999'}}>No ID card uploaded</span>
                    )}
                  </div>
                  <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
                    <strong>Applied:</strong> {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  {app.application_status === 'pending' && (
                    <div style={{marginTop: '10px'}}>
                      <button 
                        onClick={() => approveStudent(app.id)}
                        style={{background: '#27ae60', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', marginRight: '5px', cursor: 'pointer'}}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => rejectStudent(app.id)}
                        style={{background: '#e74c3c', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer'}}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section style={{border: '2px solid #27ae60', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#f8f9fa'}}>
          <h2 style={{color: '#27ae60', borderBottom: '2px solid #27ae60', paddingBottom: '10px'}}>📚 Manage Textbooks</h2>
          <form onSubmit={handleAddBook} style={{background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
              <input
                type="text"
                placeholder="Title"
                value={bookData.title}
                onChange={(e) => setBookData({...bookData, title: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                required
              />
              <input
                type="text"
                placeholder="Author"
                value={bookData.author}
                onChange={(e) => setBookData({...bookData, author: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                required
              />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px'}}>
              <input
                type="number"
                placeholder="Publication Year"
                value={bookData.publication_year}
                onChange={(e) => setBookData({...bookData, publication_year: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                required
              />
              <textarea
                placeholder="Description"
                value={bookData.description}
                onChange={(e) => setBookData({...bookData, description: e.target.value})}
                style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', minHeight: '80px'}}
                required
              />
            </div>
            <button type="submit" style={{background: '#27ae60', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}>
              ➕ Add Book
            </button>
          </form>
        </section>

        <section style={{border: '2px solid #3498db', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#f8f9fa'}}>
          <h3 style={{color: '#2980b9', borderBottom: '2px solid #3498db', paddingBottom: '10px'}}>📖 All Textbooks ({books.length})</h3>
          {books.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No textbooks found. Add your first textbook above!</p>
            </div>
          ) : (
            <div>
              {books.map(book => (
                <div key={book.id} style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  margin: '15px 0',
                  borderRadius: '8px',
                  background: 'white',
                  borderLeft: '5px solid #3498db'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <h4 style={{margin: '0 0 10px 0', color: '#2c3e50', fontSize: '18px'}}>{book.title}</h4>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '14px', color: '#666'}}>
                        <div><strong>Author:</strong> {book.author}</div>
                        <div><strong>Year:</strong> {book.publication_year}</div>
                        <div><strong>ID:</strong> #{book.id}</div>
                      </div>
                      <div style={{marginTop: '10px', fontSize: '14px', color: '#555'}}>
                        <strong>Description:</strong> {book.description}
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '10px', marginLeft: '20px'}}>
                      <button 
                        onClick={() => startEdit(book)}
                        style={{background: '#f39c12', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px'}}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        style={{background: '#e74c3c', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px'}}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {editingBook && (
          <section style={{border: '2px solid #f39c12', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#fef9e7'}}>
            <h3 style={{color: '#e67e22', borderBottom: '2px solid #f39c12', paddingBottom: '10px'}}>✏️ Edit Book</h3>
            <form onSubmit={handleEditBook} style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <input
                  type="text"
                  placeholder="Title"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={editData.author}
                  onChange={(e) => setEditData({...editData, author: e.target.value})}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px'}}>
                <input
                  type="number"
                  placeholder="Publication Year"
                  value={editData.publication_year}
                  onChange={(e) => setEditData({...editData, publication_year: e.target.value})}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px'}}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  style={{padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', minHeight: '80px'}}
                  required
                />
              </div>
              <div style={{display: 'flex', gap: '15px'}}>
                <button 
                  type="submit" 
                  style={{background: '#27ae60', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
                >
                  ✅ Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  style={{background: '#95a5a6', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section style={{border: '2px solid #9b59b6', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#f8f9fa'}}>
          <h3 style={{color: '#8e44ad', borderBottom: '2px solid #9b59b6', paddingBottom: '10px'}}>👥 Assign Books to Reviewers</h3>
          <form onSubmit={handleAssignBook} style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>📚 Select Textbook:</label>
                <select
                  value={assignBookId}
                  onChange={(e) => setAssignBookId(e.target.value)}
                  style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', background: 'white'}}
                  required
                >
                  <option value="">Choose a textbook...</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title || `Book ${book.id}`} ({book.publication_year})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>👤 Select Reviewer:</label>
                <select
                  value={assignReviewerId}
                  onChange={(e) => setAssignReviewerId(e.target.value)}
                  style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', background: 'white'}}
                  required
                >
                  <option value="">Choose a reviewer...</option>
                  {reviewers.map(reviewer => (
                    <option key={reviewer.id} value={reviewer.id}>
                      {reviewer.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              type="submit" 
              style={{background: '#9b59b6', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              🔗 Assign Book to Reviewer
            </button>
          </form>
          
          <div style={{marginTop: '15px', padding: '10px', background: '#e8f4fd', borderRadius: '5px', fontSize: '14px', color: '#2980b9'}}>
            💡 <strong>Tip:</strong> Assigned books will appear in the reviewer's dashboard for review.
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;