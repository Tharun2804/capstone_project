import React, { useState, useEffect } from 'react';

const DebugReviewers = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const login = async () => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });
      
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setError('✅ Logged in successfully');
      } else {
        setError('❌ Login failed: ' + data.message);
      }
    } catch (err) {
      setError('❌ Login error: ' + err.message);
    }
  };

  const fetchApplications = async () => {
    if (!token) {
      setError('❌ Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/admin/reviewer-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApplications(data);
      setError(`✅ Found ${data.length} applications`);
    } catch (err) {
      setError('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      const response = await fetch(`/admin/reviewer-applications/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setError('✅ Approved successfully');
        fetchApplications();
      } else {
        setError('❌ Approve failed');
      }
    } catch (err) {
      setError('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Debug Reviewer Applications</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Step 1: Login</h3>
        <button onClick={login} style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none' }}>
          Login as Admin
        </button>
        {error && <div style={{ marginTop: '10px', color: error.includes('✅') ? 'green' : 'red' }}>{error}</div>}
      </div>

      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Step 2: Fetch Applications</h3>
        <button onClick={fetchApplications} disabled={loading} style={{ padding: '10px', background: '#27ae60', color: 'white', border: 'none' }}>
          {loading ? 'Loading...' : 'Get Applications'}
        </button>
      </div>

      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Applications ({applications.length})</h3>
        {applications.length === 0 ? (
          <p>No applications found</p>
        ) : (
          applications.map(app => (
            <div key={app.id} style={{ 
              border: '1px solid #ddd', 
              padding: '10px', 
              margin: '10px 0',
              borderLeft: `5px solid ${app.application_status === 'pending' ? 'orange' : 'green'}`
            }}>
              <h4>{app.username} ({app.application_status})</h4>
              <p>Qualification: {app.educational_qualification}</p>
              <p>Specialization: {app.specialization}</p>
              <p>Experience: {app.years_experience} years</p>
              {app.application_status === 'pending' && (
                <button onClick={() => approve(app.id)} style={{ background: 'green', color: 'white', padding: '5px 10px', border: 'none' }}>
                  Approve
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugReviewers;