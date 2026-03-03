import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    description: '',
    required: '',
    image: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      await axios.post('http://localhost:4000/api/user/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-home-link">
        <Link to="/">← Back to Home</Link>
      </div>
      <div className="auth-form">
        <h2>Create Campaign</h2>
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
          <button type="submit">Create Campaign</button>
        </form>
        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

export default CreateCampaign;
