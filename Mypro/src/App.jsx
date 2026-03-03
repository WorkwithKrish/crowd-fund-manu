import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DonationSuccess from './pages/DonationSuccess';
import DonationFailure from './pages/DonationFailure';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/create" element={<CreateCampaign />} />
        <Route path="/edit/:id" element={<EditCampaign />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/donation/success/:id" element={<DonationSuccess />} />
        <Route path="/donation/failure" element={<DonationFailure />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
