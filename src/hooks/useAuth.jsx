import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setUser({ token: data.token, role: data.role });
        return { success: true, role: data.role };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (username, email, password, role, reviewerData = null, mobileNumber = '', studentData = null) => {
    try {
      console.log('Register function called with:', { username, email, role, studentData, reviewerData });
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('mobileNumber', mobileNumber);
      
      // Add reviewer-specific data if role is reviewer
      if (role === 'reviewer' && reviewerData) {
        formData.append('educationalQualification', reviewerData.educationalQualification);
        formData.append('specialization', reviewerData.specialization);
        formData.append('yearsExperience', reviewerData.yearsExperience);
        formData.append('currentDesignation', reviewerData.currentDesignation);
        formData.append('currentInstitution', reviewerData.currentInstitution);
        formData.append('publications', reviewerData.publications);
        formData.append('reviewerType', reviewerData.reviewerType);
        
        // Add uploaded files
        if (reviewerData.proofDocuments && reviewerData.proofDocuments.length > 0) {
          for (let i = 0; i < reviewerData.proofDocuments.length; i++) {
            formData.append('proofDocuments', reviewerData.proofDocuments[i]);
          }
        }
      }
      
      // Add student-specific data if role is student
      if (role === 'student' && studentData) {
        console.log('Adding student data to form:', studentData);
        formData.append('studentId', studentData.studentId);
        formData.append('institution', studentData.institution);
        formData.append('course', studentData.course);
        formData.append('yearOfStudy', studentData.yearOfStudy);
        
        // Add ID card file
        if (studentData.idCard) {
          formData.append('idCard', studentData.idCard);
        }
      }
      
      console.log('Sending registration request...');
      const response = await fetch('/register', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });
      return { success: response.ok, message: data.message || data.error };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed: ' + error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};