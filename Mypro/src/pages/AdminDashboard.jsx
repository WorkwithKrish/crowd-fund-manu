import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchAllDonations();
  }, [isAdmin]);

  const fetchAllDonations = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/donation/all');
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

  if (!isAdmin) return null;

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDonors = new Set(donations.map(d => d.donor?._id)).size;

  return (
    <div className="admin-page">
      <header className="header">
        <h1>CrowdFund Admin</h1>
        <nav>
          <Link to="/">Home</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      <div className="admin-container">
        <h2>Donation Dashboard</h2>
        
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{donations.length}</span>
            <span className="stat-label">Total Donations</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">${totalRaised}</span>
            <span className="stat-label">Total Raised</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalDonors}</span>
            <span className="stat-label">Total Donors</span>
          </div>
        </div>

        <div className="donations-table">
          <h3>All Donations</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : donations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Email</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation._id}>
                    <td>{donation.donor?.name || 'Anonymous'}</td>
                    <td>{donation.donor?.email || '-'}</td>
                    <td>{donation.campaign?.title || 'N/A'}</td>
                    <td className="amount">${donation.amount}</td>
                    <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                    <td><span className="status">{donation.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No donations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
