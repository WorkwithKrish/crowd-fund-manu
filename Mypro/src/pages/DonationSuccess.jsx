import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function DonationSuccess() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="donation-success">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>Thank You for Your Donation!</h1>
        <p>Your generosity helps make a difference.</p>
        
        {donation && (
          <div className="donation-details">
            <p><strong>Donation Amount:</strong> ${donation.amount}</p>
            <p><strong>Transaction ID:</strong> {donation.transactionId}</p>
            <p><strong>Status:</strong> {donation.transactionComplete ? 'Completed' : 'Processing'}</p>
          </div>
        )}
        
        <div className="success-actions">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to={`/campaign/${donation?.campaign}`} className="btn-secondary">View Campaign</Link>
        </div>
      </div>
    </div>
  );
}

export default DonationSuccess;
