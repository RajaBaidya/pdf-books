import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/admin.css';

// Create an axios instance with the correct base URL
const api = axios.create({
  baseURL: 'https://pdf-books-b3yd.onrender.com'
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminDashboard = ({ user: propUser }) => {
  const [user, setUser] = useState(propUser || null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userId, setUserId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('userManagement');
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
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // If user is loaded (either from props or localStorage) check if admin
    if (user) {
      // Redirect if not admin
      if (!user.isAdmin) {
        console.log('User is not an admin, redirecting to home');
        navigate('/home');
        return;
      }

      console.log("Fetching users data...");
      
      // Fetch users
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          console.log("Using token:", token ? "Token exists" : "No token found");
          
          const response = await api.get('/users');
          
          console.log("Users data received:", response.data);
          setUsers(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching users:", err);
          setError(`Failed to fetch users: ${err.message || 'Unknown error'}`);
          if (err.response) {
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
          }
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [user, navigate, refreshTrigger]);

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('Please enter a valid user ID');
      setSuccess(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await api.put(`/auth/promote/${userId}`, {});
      
      setSuccess('User promoted to admin successfully');
      setUserId('');
      // Refresh user list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote user');
      setLoading(false);
    }
  };

  const openDeleteModal = (userToDelete) => {
    setUserToDelete(userToDelete);
    setShowDeleteModal(true);
    setError(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setError(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/users/${userToDelete._id}`);
      
      setSuccess(`User ${userToDelete.name} deleted successfully`);
      closeDeleteModal();
      // Refresh user list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Loading state when checking user authentication or waiting for user data
  if (!user) {
    return <div className="admin-loading">Loading user information...</div>;
  }

  // Loading state when waiting for users data
  if (loading && users.length === 0) {
    return <div className="admin-loading">Loading data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab-button ${activeTab === 'userManagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('userManagement')}
        >
          User Management
        </button>
        <button 
          className={`admin-tab-button ${activeTab === 'debugInfo' ? 'active' : ''}`}
          onClick={() => setActiveTab('debugInfo')}
        >
          Debug Information
        </button>
      </div>
      
      {/* Debug Information Tab */}
      {activeTab === 'debugInfo' && (
        <div className="admin-card debug-card">
          <h2>Debug Information</h2>
          <div className="debug-info">
            <p><strong>Loading state:</strong> {loading ? "Loading..." : "Not loading"}</p>
            <p><strong>User count:</strong> {users ? users.length : "No users"}</p>
            <p><strong>Current user:</strong> {user ? user.name : "No current user"}</p>
            <p><strong>Admin status:</strong> {user?.isAdmin ? "Is admin" : "Not admin"}</p>
            <p><strong>Token exists:</strong> {localStorage.getItem('token') ? "Yes" : "No"}</p>
          </div>
          <div className="debug-raw">
            <h3>Raw user data:</h3>
            <pre>{users && users.length > 0 ? JSON.stringify(users[0], null, 2) : "No user data"}</pre>
          </div>
        </div>
      )}
      
      {/* User Management Tab */}
      {activeTab === 'userManagement' && (
        <div className="admin-section">
          {/* Promote User Section - Now at the top of User Management */}
          <div className="admin-card">
            <h2>Promote User to Admin</h2>
            <form onSubmit={handlePromoteUser} className="admin-form">
              <div className="form-group">
                <label htmlFor="userId">User ID:</label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="admin-input"
                />
              </div>
              <button type="submit" className="admin-button">
                Promote to Admin
              </button>
            </form>
          </div>
          
          {/* User Management Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>User Management</h2>
              <div className="admin-stats">
                <div className="admin-stat">
                  <span className="stat-label">Total Users:</span>
                  <span className="stat-value">{users.length}</span>
                </div>
                <div className="admin-stat">
                  <span className="stat-label">Admins:</span>
                  <span className="stat-value">{users.filter(u => u.isAdmin).length}</span>
                </div>
              </div>
            </div>
            
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="admin-users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Admin Status</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userItem => (
                      <tr key={userItem._id} className={userItem._id === user._id ? 'current-user-row' : ''}>
                        <td className="user-id">{userItem._id}</td>
                        <td>{userItem.name}</td>
                        <td>{userItem.email}</td>
                        <td>
                          <span className={userItem.isAdmin ? 'admin-status active' : 'admin-status'}>
                            {userItem.isAdmin ? 'Admin' : 'Normal User'}
                          </span>
                        </td>
                        <td>{formatDate(userItem.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            {!userItem.isAdmin && (
                              <button 
                                className="action-button promote-button"
                                onClick={() => {
                                  setUserId(userItem._id);
                                  handlePromoteUser({ preventDefault: () => {} });
                                }}
                                title="Promote to admin"
                              >
                                Promote
                              </button>
                            )}
                            {userItem._id !== user._id && (
                              <button 
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(userItem)}
                                title="Delete user"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete User Account</h2>
            <p>Are you sure you want to delete the following user account? This action cannot be undone.</p>
            
            <div className="user-delete-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{userToDelete.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{userToDelete.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Account Type:</span>
                <span className="info-value">
                  {userToDelete.isAdmin ? 'Administrator' : 'Regular User'}
                </span>
              </div>
            </div>
            
            <div className="modal-buttons">
              <button 
                onClick={closeDeleteModal}
                className="admin-button cancel-button"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleDeleteUser}
                className="admin-button confirm-delete-button"
              >
                Delete User
              </button>
            </div>
            
            {error && <div className="admin-error modal-error">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 