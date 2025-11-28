import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [message, setMessage] = useState('');
  
  // Reviewer-specific fields
  const [reviewerData, setReviewerData] = useState({
    educationalQualification: '',
    specialization: '',
    yearsExperience: '',
    currentDesignation: '',
    currentInstitution: '',
    publications: '',
    reviewerType: '',
    proofDocuments: []
  });
  
  // Student-specific fields
  const [studentData, setStudentData] = useState({
    studentId: '',
    institution: '',
    course: '',
    yearOfStudy: '',
    idCard: null
  });
  
  const { register } = useAuth();

  const handleReviewerDataChange = (field, value) => {
    setReviewerData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setReviewerData(prev => ({ ...prev, proofDocuments: Array.from(e.target.files) }));
  };
  
  const handleStudentDataChange = (field, value) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleIdCardChange = (e) => {
    setStudentData(prev => ({ ...prev, idCard: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', { username, email, role, studentData, reviewerData });
    
    try {
      const result = await register(username, email, password, role, reviewerData, mobileNumber, studentData);
      console.log('Registration result:', result);
      setMessage(result.message);
      
      if (result.success) {
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('');
        setMobileNumber('');
        setReviewerData({
          educationalQualification: '',
          specialization: '',
          yearsExperience: '',
          currentDesignation: '',
          currentInstitution: '',
          publications: '',
          reviewerType: '',
          proofDocuments: []
        });
        setStudentData({
          studentId: '',
          institution: '',
          course: '',
          yearOfStudy: '',
          idCard: null
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <style>{`
        .register-page {
          min-height: 100vh;
          background-image: url('/reg.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          position: relative;
        }
        
        .register-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .register-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 600px;
          border: 2px solid rgba(255,255,255,0.4);
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 2;
          transform: translateY(0);
          transition: all 0.3s ease;
        }
        
        .register-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 35px 70px rgba(0,0,0,0.4);
        }
        
        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .register-header h1 {
          color: #2c3e50;
          font-size: 32px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }
        
        .register-header p {
          color: #7f8c8d;
          font-size: 16px;
          margin: 0;
        }
        
        .status-message {
          padding: 12px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .status-message.success {
          background: #27ae60;
          color: white;
        }
        
        .status-message.error {
          background: #e74c3c;
          color: white;
        }
        
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .input-group {
          position: relative;
        }
        
        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #ecf0f1;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
          box-sizing: border-box;
        }
        
        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .role-specific-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #3498db;
        }
        
        .role-specific-section h3 {
          color: #2c3e50;
          margin: 0 0 20px 0;
          font-size: 18px;
        }
        
        .file-upload {
          border: 2px dashed #bdc3c7;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .file-upload:hover {
          border-color: #3498db;
          background: #f8f9fa;
        }
        
        .file-upload input[type="file"] {
          margin: 10px 0;
        }
        
        .file-upload small {
          color: #7f8c8d;
          font-size: 14px;
        }
        
        .register-btn {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }
        
        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(39, 174, 96, 0.3);
        }
        
        .login-link {
          text-align: center;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }
        
        .login-link p {
          color: #7f8c8d;
          margin: 0;
        }
        
        .login-link a {
          color: #3498db;
          text-decoration: none;
          font-weight: bold;
          transition: color 0.3s ease;
        }
        
        .login-link a:hover {
          color: #2980b9;
        }
        
        @media (max-width: 768px) {
          .register-container {
            padding: 30px 20px;
            margin: 10px;
            max-width: 95%;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .register-header h1 {
            font-size: 28px;
          }
        }
      `}</style>
      
      <div className="register-container">
        <div className="register-header">
          <h1>🚀 Join TextbookQA</h1>
          <p>Create your account and start your journey</p>
        </div>
        
        {message && <div className={`status-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <input
                type="text"
                placeholder="👤 Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="email"
                placeholder="📧 Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-grid">
            <div className="input-group">
              <input
                type="password"
                placeholder="🔒 Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="tel"
                placeholder="📱 Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>👥 Select Your Role</option>
              <option value="reviewer">📝 Reviewer</option>
              <option value="publisher">📚 Publisher</option>
              <option value="student">🎓 Student</option>
            </select>
          </div>
          
          {/* Reviewer-specific fields */}
          {role === 'reviewer' && (
            <div className="role-specific-section">
              <h3>📝 Reviewer Details</h3>
              <div className="form-grid">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="🎓 Educational Qualification"
                    value={reviewerData.educationalQualification}
                    onChange={(e) => handleReviewerDataChange('educationalQualification', e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="🔬 Specialization/Subject Area"
                    value={reviewerData.specialization}
                    onChange={(e) => handleReviewerDataChange('specialization', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-grid">
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="⏱️ Years of Experience"
                    value={reviewerData.yearsExperience}
                    onChange={(e) => handleReviewerDataChange('yearsExperience', e.target.value)}
                    min="0"
                    required
                  />
                </div>
                
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="💼 Current Designation"
                    value={reviewerData.currentDesignation}
                    onChange={(e) => handleReviewerDataChange('currentDesignation', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="🏢 Current Institution/Organization"
                  value={reviewerData.currentInstitution}
                  onChange={(e) => handleReviewerDataChange('currentInstitution', e.target.value)}
                  required
                />
              </div>
              
              <div className="input-group">
                <textarea
                  placeholder="📚 Publications/Research Work (Optional)"
                  value={reviewerData.publications}
                  onChange={(e) => handleReviewerDataChange('publications', e.target.value)}
                  rows="3"
                />
              </div>
              
              <div className="input-group">
                <select
                  value={reviewerData.reviewerType}
                  onChange={(e) => handleReviewerDataChange('reviewerType', e.target.value)}
                  required
                >
                  <option value="" disabled>📋 Select Reviewer Type</option>
                  <option value="subject-wise">Subject-wise Reviewer</option>
                  <option value="book-type">Book Type Reviewer</option>
                  <option value="general">General Reviewer</option>
                </select>
              </div>
              <div className="file-upload">
                <label>Upload Proof Documents (Degree, ID, CV):</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <small>Upload degree certificate, ID proof, and CV (Multiple files allowed)</small>
              </div>
            </div>
          )}
          
          {/* Student-specific fields */}
          {role === 'student' && (
            <div className="role-specific-section">
              <h3>🎓 Student Details</h3>
              <div className="form-grid">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="🆔 Student ID"
                    value={studentData.studentId}
                    onChange={(e) => handleStudentDataChange('studentId', e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="🏫 Institution/University"
                    value={studentData.institution}
                    onChange={(e) => handleStudentDataChange('institution', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-grid">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="📖 Course (e.g., BAMS, MBBS)"
                    value={studentData.course}
                    onChange={(e) => handleStudentDataChange('course', e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <select
                    value={studentData.yearOfStudy}
                    onChange={(e) => handleStudentDataChange('yearOfStudy', e.target.value)}
                    required
                  >
                    <option value="" disabled>📅 Select Year of Study</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
              </div>
              <div className="file-upload">
                <label>Upload Student ID Card:</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleIdCardChange}
                />
                <small>Upload a clear photo of your student ID card</small>
              </div>
            </div>
          )}
          
          <button type="submit" className="register-btn">
            🚀 Create Account
          </button>
        </form>
        
        <div className="login-link">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;