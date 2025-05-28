import React from 'react';
import { logout } from '../api/auth';

const HomePage = ({ user, onLogout }) => {
  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome, {user.name}!</h1>
        <p className="user-email">Logged in as: {user.email}</p>
      </div>
      
      <div className="action-section">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage; 