import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:4000/api/donation/user/donations?userId=${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <header className="header">
        <h1>CrowdFund</h1>
        <nav>
          <Link to="/">Home</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <h2>{user.name || 'User'}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="donations-section">
          <h3>My Donations</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : donations.length > 0 ? (
            <div className="donations-list">
              {donations.map((donation) => (
                <div key={donation._id} className="donation-item">
                  <div className="donation-info">
                    <span className="donation-campaign">{donation.campaign?.title || 'Campaign'}</span>
                    <span className="donation-amount">${donation.amount}</span>
                    <span className="donation-date">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="donation-status">{donation.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-donations">No donations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
