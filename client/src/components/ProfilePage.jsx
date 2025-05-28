import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/profile.css';

const ProfilePage = ({ user: propUser, onLogout }) => {
  const [user, setUser] = useState(propUser || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // If user prop is not available, try to load from localStorage
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          console.error('Failed to parse stored user data:', err);
          navigate('/login');
        }
      } else {
        // No user in localStorage, redirect to login
        navigate('/login');
      }
    }
    setLoading(false);
  }, [user, navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/users/password', 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.name) {
      setError('Please type your username correctly to confirm deletion');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onLogout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return <div className="profile-loading">Unable to load user data</div>;
  }

  return (
    <div className="profile-page-container">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="profile-content">
        <h1>Profile Details</h1>
        
        <div className="profile-card user-info-card">
          <div className="profile-header">
            <h2>Account Information</h2>
            <div className="user-avatar-large">{user.name.charAt(0).toUpperCase()}</div>
          </div>
          
          <div className="profile-info">
            <div className="info-group">
              <label>Username</label>
              <p>{user.name}</p>
            </div>
            
            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            
            <div className="info-group">
              <label>Account Type</label>
              <p>
                <span className={user.isAdmin ? "account-type admin" : "account-type"}>
                  {user.isAdmin ? "Administrator" : "Regular User"}
                </span>
              </p>
            </div>
            
            <div className="info-group">
              <label>Member Since</label>
              <p>{user.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
            </div>
          </div>
        </div>
        
        <div className="profile-card">
          <h2>Update Password</h2>
          {error && <div className="profile-error">{error}</div>}
          {success && <div className="profile-success">{success}</div>}
          
          <form onSubmit={handleUpdatePassword} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="profile-button update-button"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
        
        <div className="profile-card danger-zone">
          <h2>Danger Zone</h2>
          <p className="danger-text">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="profile-button delete-button"
          >
            Delete Account
          </button>
        </div>
      </div>
      
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Account</h2>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            <p className="confirm-text">Please type <strong>{user.name}</strong> to confirm:</p>
            
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="profile-input delete-confirm"
              placeholder="Type your username"
            />
            
            <div className="modal-buttons">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setError(null);
                }}
                className="profile-button cancel-button"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleDeleteAccount}
                className="profile-button confirm-delete-button"
                disabled={deleteConfirmation !== user.name}
              >
                Delete Account
              </button>
            </div>
            
            {error && <div className="profile-error modal-error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 