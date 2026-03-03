import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    description: '',
    required: '',
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/campaign/${id}`);
      const campaign = res.data;
      setFormData({
        title: campaign.title || '',
        subTitle: campaign.subTitle || '',
        description: campaign.description || '',
        required: campaign.required || '',
        image: campaign.image || ''
      });
    } catch (err) {
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login first');
      return;
    }

    try {
      await axios.put(`http://localhost:4000/api/user/${id}/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="auth-page">
      <div className="auth-home-link">
        <Link to="/">← Back to Home</Link>
      </div>
      <div className="auth-form">
        <h2>Edit Campaign</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Campaign Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="subTitle"
            placeholder="Subtitle"
            value={formData.subTitle}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          />
          <input
            type="number"
            name="required"
            placeholder="Goal Amount ($)"
            value={formData.required}
            onChange={handleChange}
            required
          />
          <input
            type="url"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
          />
          <button type="submit">Update Campaign</button>
        </form>
        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

export default EditCampaign;
