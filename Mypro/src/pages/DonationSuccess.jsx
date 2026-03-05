import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DonationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = (() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      return JSON.parse(userData);
    }
    return null;
  })();

  const isAdmin = user?.email === 'admin@test.com' || user?.email === 'manasansreeoffi@gmail.com';

  useEffect(() => {
    fetchDonationDetails();
  }, [id]);

  const fetchDonationDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/donation/success/${id}`);
      setDonation(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch donation details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="home">
      <header className="header">
        <h1>CrowdFund</h1>
        <nav>
          <Link to="/">Home</Link>
          {user ? (
            <>
              <span>Welcome, {user.name || user.email}</span>
              <Link to="/profile">Profile</Link>
              {isAdmin && <Link to="/create">Create Campaign</Link>}
              {isAdmin && <Link to="/admin">Admin</Link>}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <section className="result-page">
        <div className="result-container success">
          <div className="result-icon success-icon-svg">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#27ae60" />
              <path d="M30 50 L45 65 L70 35" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>Thank You for Your Donation!</h1>
          <p className="result-message">Your generosity helps make a real difference in someone's life.</p>

          {loading ? (
            <div className="loading">Loading donation details...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : donation && (
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Donation Amount</span>
                <span className="detail-value amount">${donation.amount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transaction ID</span>
                <span className="detail-value">{donation.transactionId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="status-badge success">Completed</span>
              </div>
            </div>
          )}

          <div className="confetti">
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
          </div>

          <div className="result-actions">
            <Link to="/" className="btn-primary">Back to Home</Link>
            {donation?.campaign && (
              <Link to={`/campaign/${donation.campaign}`} className="btn-secondary">View Campaign</Link>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CrowdFund</h3>
            <p>Empowering dreams, one donation at a time.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: support@crowdfund.com</p>
            <p>Phone: +1 234 567 890</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 CrowdFund. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default DonationSuccess;
