
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ctrl = require("../controllers");
const { Donation, Campaign } = require("../models");

router.get("/success/:id", ctrl.donation.details);

router.post("/:id/donate", async (req, res) => {
  try {
    const { amount } = req.body;
    const campaignId = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.raisedAmount >= campaign.required) {
      return res.status(400).json({ message: "Campaign goal already reached. No more donations accepted." });
    }

    const donationData = {
      campaign: campaignId,
      amount: amount,
      status: "completed",
      transactionId: "DON-" + Date.now()
    };

    if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
      donationData.donor = req.body.userId;
    }

    const donation = new Donation(donationData);
    await donation.save();

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { raisedAmount: amount }
    });

    let donorCount = campaign.donorsNum;
    if (typeof donorCount !== 'number') {
      donorCount = 0;
    }
    campaign.donorsNum = donorCount + 1;
    await campaign.save();

    const updatedCampaign = await Campaign.findById(campaignId);
    let message = "Donation successful!";
    if (updatedCampaign.raisedAmount >= updatedCampaign.required) {
      message = "Donation successful! Campaign goal reached!";
    }

    res.status(200).json({ 
      message: message,
      donation: donation,
      goalReached: updatedCampaign.raisedAmount >= updatedCampaign.required
    });
  } catch (err) {
    console.error("Donation error:", err);
    res.status(500).json({ message: "Donation failed: " + err.message });
  }
});

router.get("/user/donations", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const donations = await Donation.find({ donor: userId })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
});

router.delete("/cleanup/all", async (req, res) => {
  try {
    await Donation.deleteMany({});
    res.status(200).json({ message: "All donations deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete donations" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
});

module.exports = router;
