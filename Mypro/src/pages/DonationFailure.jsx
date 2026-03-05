import { Link, useNavigate } from 'react-router-dom';

function DonationFailure() {
  const navigate = useNavigate();

  const user = (() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      return JSON.parse(userData);
    }
    return null;
  })();

  const isAdmin = user?.email === 'admin@test.com' || user?.email === 'manasansreeoffi@gmail.com';

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
        <div className="result-container failure">
          <div className="result-icon failure-icon-svg">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#e74c3c" />
              <path d="M35 35 L65 65" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M65 35 L35 65" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Payment Failed</h1>
          <p className="result-message">Unfortunately, your donation could not be processed.</p>
          <p className="result-subtext">Please try again or contact support if the problem persists.</p>

          <div className="result-details help-box">
            <h3>Need Help?</h3>
            <ul>
              <li>Check if your card has sufficient balance</li>
              <li>Verify your payment details are correct</li>
              <li>Try a different payment method</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>

          <div className="result-actions">
            <Link to="/" className="btn-primary">Back to Home</Link>
            <button onClick={() => navigate(-1)} className="btn-secondary">Try Again</button>
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

export default DonationFailure;
