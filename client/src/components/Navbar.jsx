import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';
import { logout } from '../api/auth';

const Navbar = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Get first letter of username for avatar
  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U'; // Default initial
  };

  // Get shortened username (first 6 letters)
  const getShortUsername = () => {
    if (user && user.name) {
      // Get first 6 characters or full name if shorter
      return user.name.length > 6 ? 
        `${user.name.substring(0, 6)}...` : 
        user.name;
    }
    return 'User'; // Default username
  };

  const handleLogout = () => {
    logout();
    onLogout();
    // Navigate to login page
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/home" className="logo-text">KolotiClone</Link>
        </div>

        <div 
          className={`navbar-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="spacer"></div>

          <div className="user-actions">
            <button 
              className="withdraw-button"
              onClick={() => navigate('/withdraw')}
            >
              WITHDRAW
            </button>
            
            <div className="user-menu" ref={menuRef}>
              <div 
                className={`user-profile ${dropdownOpen ? 'active' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">{getUserInitial()}</div>
                <span className="user-name">{getShortUsername()}</span>
                {user && user.isAdmin && <span className="admin-badge">Admin</span>}
              </div>
              
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    {user && user.isAdmin ? 'Admin Menu' : 'User Menu'}
                  </div>
                  <Link to="/home" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="dropdown-icon home-icon"></i>
                    <span>Home</span>
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="dropdown-icon profile-icon"></i>
                    <span>Profile Details</span>
                  </Link>
                  <Link to="/books" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="dropdown-icon books-icon"></i>
                    <span>Books</span>
                  </Link>
                  {user && user.isAdmin && (
                    <>
                      <Link to="/admin" className="dropdown-item admin-item" onClick={() => setDropdownOpen(false)}>
                        <i className="dropdown-icon admin-icon"></i>
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link to="/admin/books" className="dropdown-item admin-item" onClick={() => setDropdownOpen(false)}>
                        <i className="dropdown-icon books-icon"></i>
                        <span>Manage Books</span>
                      </Link>
                    </>
                  )}
                  <div className="dropdown-section">
                    <div className="dropdown-section-title">Daily Statistics</div>
                    <div className="dropdown-stat">
                      <span>Tasks Completed Today:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="dropdown-stat">
                      <span>Earnings:</span>
                      <span className="stat-value">$0.00</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="dropdown-icon logout-icon"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 