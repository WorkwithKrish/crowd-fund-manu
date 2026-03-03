import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [campaigns, setCampaigns] = useState([]);
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
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/campaign/all');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:4000/api/user/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(campaigns.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete campaign');
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

      {!user && (
        <section className="hero">
          <h2>Support Causes You Care About</h2>
          <p>Join thousands of donors making a difference</p>
          <Link to="/register" className="cta-btn">Start a Campaign</Link>
        </section>
      )}

      {!user && (
        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Create a Campaign</h3>
              <p>Set your fundraising goal and share your story</p>
            </div>
            <div className="step">
              <div className="step-icon">2</div>
              <h3>Share with Others</h3>
              <p>Share your campaign on social media</p>
            </div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3>Receive Donations</h3>
              <p>Collect donations from supporters</p>
            </div>
            <div className="step">
              <div className="step-icon">4</div>
              <h3>Make a Difference</h3>
              <p>Achieve your goal and help others</p>
            </div>
          </div>
        </section>
      )}

      {!user && (
      <section className="success-stories">
        <h2>Success Stories</h2>
        <div className="stories-container">
          <div className="story-card">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400" alt="Story 1" />
            <div className="story-content">
              <h3>Education for All</h3>
              <p>Raised $50,000 to provide education for underprivileged children</p>
              <span className="story-amount">$50,000 raised</span>
            </div>
          </div>
          <div className="story-card">
            <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400" alt="Story 2" />
            <div className="story-content">
              <h3>Medical Help</h3>
              <p>Helped a family with critical medical expenses</p>
              <span className="story-amount">$25,000 raised</span>
            </div>
          </div>
          <div className="story-card">
            <img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400" alt="Story 3" />
            <div className="story-content">
              <h3>Community Center</h3>
              <p>Built a community center for local residents</p>
              <span className="story-amount">$100,000 raised</span>
            </div>
          </div>
        </div>
      </section>
      )}

      {user && (
        <section className="campaigns">
          <h2>All Campaigns</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : campaigns.length > 0 ? (
            <div className="campaign-grid">
              {campaigns.map(campaign => {
                const progress = campaign.required > 0 
                  ? Math.min((campaign.raisedAmount / campaign.required) * 100, 100)
                  : 0;
                return (
                <div key={campaign._id} className="campaign-card">
                  <div className="campaign-image-container">
                    <img 
                      src={campaign.image || campaign.imageUrl || 'https://via.placeholder.com/400x200'} 
                      alt={campaign.title}
                      className="campaign-image"
                    />
                  </div>
                  <div className="campaign-content">
                    <h3>{campaign.title}</h3>
                    <p className="campaign-desc">{campaign.subTitle}</p>
                    
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <div className="campaign-stats">
                      <span>${campaign.raisedAmount || 0} raised</span>
                      <span>{campaign.donorsNum || 0} donors</span>
                      <span>{campaign.daysLeft || 0} days left</span>
                    </div>
                    
                    <div className="campaign-actions">
                      <Link to={`/campaign/${campaign._id}`} className="donate-btn">
                        View Details
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/edit/${campaign._id}`} className="edit-btn">
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(campaign._id)} 
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <p className="no-campaigns">No campaigns yet.</p>
          )}
        </section>
      )}

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

export default Home;
