import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import Navbar from './Navbar';

const Home = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const handleBooksClick = () => {
    navigate('/books');
  };
  
  return (
    <div className="dashboard-container">
      <Navbar user={user} onLogout={onLogout} />

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h1 className="welcome-title">Welcome, {user?.name || 'video9'}</h1>
          <p className="welcome-subtitle">Choose an earning option to get started</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">TOTAL EARNED</div>
            <div className="stat-value">$0.02</div>
            <div className="stat-subtitle">lifetime earnings</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">TOTAL TASKS</div>
            <div className="stat-value">3</div>
            <div className="stat-subtitle">total tasks</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">AVAILABLE TASKS</div>
            <div className="stat-value">2</div>
            <div className="stat-subtitle">available tasks</div>
          </div>
        </div>

        <div className="earning-section">
          <h2 className="section-title">Earning Options</h2>
          
          <div className="options-container">
            <div className="option-card">
              <div className="option-icon shortlinks-icon">
                <span></span>
              </div>
              <h3 className="option-title">Shortlinks</h3>
              <p className="option-description">Complete shortlink tasks to earn tokens. Fast and easy way to earn.</p>
              <div className="option-reward">
                Reward: <span className="reward-value">$0.01 - $0.05 per task</span>
              </div>
            </div>
            
            <div className="option-card">
              <div className="option-icon surveys-icon">
                <span></span>
              </div>
              <h3 className="option-title">Surveys</h3>
              <p className="option-description">Complete surveys from our partners and earn higher rewards.</p>
              <div className="option-reward">
                Reward: <span className="reward-value">$0.50 - $3.00 per survey</span>
              </div>
            </div>
            
            <div className="option-card clickable" onClick={handleBooksClick}>
              <div className="option-icon micro-tasks-icon">
                <span></span>
              </div>
              <h3 className="option-title">Books</h3>
              <p className="option-description">Read your favorite books.</p>
              <div className="option-reward">
                Reward: <span className="reward-value">$0.10 - $1.00 per task</span>
              </div>
            </div>
            
            <div className="option-card">
              <div className="option-icon referrals-icon">
                <span></span>
              </div>
              <h3 className="option-title">Referrals</h3>
              <p className="option-description">Invite friends to join and earn a commission from their earnings.</p>
              <div className="option-reward">
                Reward: <span className="reward-value">10% of referral earnings</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 