import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import PublisherDashboard from './pages/PublisherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import PublicPage from './pages/PublicPage';
import BookDetails from './pages/BookDetails';
import DebugReviewers from './pages/DebugReviewers';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<PublicPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/reviewer" element={
              <ProtectedRoute allowedRoles={['reviewer']}>
                <ReviewerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/publisher" element={
              <ProtectedRoute allowedRoles={['publisher']}>
                <PublisherDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/book/:id" element={
              <ProtectedRoute allowedRoles={['student', 'reviewer', 'admin']}>
                <BookDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/debug" element={<DebugReviewers />} />
            <Route path="/unauthorized" element={<div>Access Denied</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;