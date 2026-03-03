import { Link } from 'react-router-dom';

function DonationFailure() {
  return (
    <div className="donation-failure">
      <div className="failure-container">
        <div className="failure-icon">✗</div>
        <h1>Payment Failed</h1>
        <p>Unfortunately, your donation could not be processed.</p>
        <p>Please try again or contact support if the problem persists.</p>
        
        <div className="failure-actions">
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default DonationFailure;
