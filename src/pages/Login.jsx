import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    
    if (result.success) {
      navigate(`/${result.role}`);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        
        .login-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-header h1 {
          color: #2c3e50;
          font-size: 32px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }
        
        .login-header p {
          color: #7f8c8d;
          font-size: 16px;
          margin: 0;
        }
        
        .status-message {
          background: #e74c3c;
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .input-group {
          position: relative;
        }
        
        .input-group input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #ecf0f1;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
          box-sizing: border-box;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .login-btn {
          background: linear-gradient(135deg, #3498db, #2980b9);
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
        
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(52, 152, 219, 0.3);
        }
        
        .signup-link {
          text-align: center;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }
        
        .signup-link p {
          color: #7f8c8d;
          margin: 0;
        }
        
        .signup-link a {
          color: #3498db;
          text-decoration: none;
          font-weight: bold;
          transition: color 0.3s ease;
        }
        
        .signup-link a:hover {
          color: #2980b9;
        }
        
        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }
        
        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }
        
        .circle:nth-child(1) {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .circle:nth-child(2) {
          width: 120px;
          height: 120px;
          top: 70%;
          right: 10%;
          animation-delay: 2s;
        }
        
        .circle:nth-child(3) {
          width: 60px;
          height: 60px;
          top: 40%;
          left: 5%;
          animation-delay: 4s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .login-header h1 {
            font-size: 28px;
          }
        }
      `}</style>
      
      <div className="decorative-elements">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <h1>🔐 Welcome Back</h1>
          <p>Sign in to your TextbookQA account</p>
        </div>
        
        {message && <div className="status-message">{message}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
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
              type="password"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-btn">
            🚀 Sign In
          </button>
        </form>
        
        <div className="signup-link">
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;