const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: String,
  description: { type: String, required: true },
  // image: String, // Uncomment if needed
  required: { type: Number, default: 1000 },
  raisedAmount: { type: Number, default: 0 },
  category: { type: String, default: 'general' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  start: { type: Date, default: Date.now },
  daysLeft: { type: Number, default: 30 },
  donorsNum: { type: Number, default: 0 },
  donors: [{
    transactionId: String,
    donationAmount: Number,
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const donationSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  transactionId: String,
  transactionComplete: { type: Boolean, default: false },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Campaign = mongoose.model('Campaign', campaignSchema);
const User = mongoose.model('User', userSchema);
const Donation = mongoose.model('Donation', donationSchema);

module.exports = {
  Campaign,
  User,
  Donation,
  mongoose,
};
