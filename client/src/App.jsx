import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/app.css';
import './styles/auth.css';
import './styles/home.css';
import './styles/navbar.css';
import './styles/admin.css';
import './styles/profile.css';
import './styles/books.css';
import './styles/adminBooks.css';
import './styles/bookDetails.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import BooksPage from './components/BooksPage';
import BookDetailsPage from './components/BookDetailsPage';
import AdminBooksPage from './components/AdminBooksPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <div className="auth-wrapper auth-mode">
              <LoginPage onRegisterClick={() => {}} onLoginSuccess={handleLoginSuccess} />
            </div>
          } />
          
          <Route path="/register" element={
            <div className="auth-wrapper auth-mode">
              <RegisterPage onLoginClick={() => {}} />
            </div>
          } />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={
              <div className="dashboard-mode">
                <Home user={user} onLogout={handleLogout} />
              </div>
            } />
            
            {/* Profile Page Route */}
            <Route path="/profile" element={
              <div className="dashboard-mode">
                <ProfilePage user={user} onLogout={handleLogout} />
              </div>
            } />

            {/* Books Page Route */}
            <Route path="/books" element={
              <div className="dashboard-mode">
                <BooksPage user={user} onLogout={handleLogout} />
              </div>
            } />
            
            {/* Book Details Page Route */}
            <Route path="/books/:id" element={
              <div className="dashboard-mode">
                <BookDetailsPage user={user} onLogout={handleLogout} />
              </div>
            } />
            
            {/* Admin Dashboard Route */}
            <Route path="/admin" element={
              <div className="dashboard-mode">
                <Navbar user={user} onLogout={handleLogout} />
                <AdminDashboard user={user} />
              </div>
            } />
            
            {/* Admin Books Route */}
            <Route path="/admin/books" element={
              <div className="dashboard-mode">
                <AdminBooksPage user={user} onLogout={handleLogout} />
              </div>
            } />
            
            {/* Withdraw Route */}
            <Route path="/withdraw" element={
              <div className="dashboard-mode">
                <Navbar user={user} onLogout={handleLogout} />
                <div className="dashboard-content">
                  <h1>Withdraw Funds</h1>
                  <p>This feature is coming soon.</p>
                </div>
              </div>
            } />
          </Route>
          
          {/* Redirect root to home if logged in, otherwise to login */}
          <Route path="/" element={
            localStorage.getItem('token') ? 
            <Navigate to="/home" replace /> : 
            <Navigate to="/login" replace />
          } />
          
          {/* Redirect old dashboard URL to home */}
          <Route path="/dashboard" element={
            <Navigate to="/home" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 