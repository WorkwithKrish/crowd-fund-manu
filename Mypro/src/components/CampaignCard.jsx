import { Link } from 'react-router-dom';

function CampaignCard({ campaign }) {
  const progress = campaign.required > 0 
    ? Math.min((campaign.raisedAmount / campaign.required) * 100, 100)
    : 0;

  return (
    <div className="campaign-card">
      <img 
        src={campaign.imageUrl || 'https://via.placeholder.com/300x200'} 
        alt={campaign.title}
        className="campaign-image"
      />
      <div className="campaign-content">
        <h3>{campaign.title}</h3>
        <p className="campaign-subtitle">{campaign.subTitle}</p>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="campaign-stats">
          <div>
            <span className="stat-value">${campaign.raisedAmount?.toLocaleString() || 0}</span>
            <span className="stat-label">raised of ${campaign.required?.toLocaleString() || 0}</span>
          </div>
          <div>
            <span className="stat-value">{campaign.donorsNum || 0}</span>
            <span className="stat-label">donors</span>
          </div>
          <div>
            <span className="stat-value">{campaign.daysLeft || 0}</span>
            <span className="stat-label">days left</span>
          </div>
        </div>
        
        <Link to={`/campaign/${campaign._id}`} className="donate-btn">
          Donate Now
        </Link>
      </div>
    </div>
  );
}

export default CampaignCard;
