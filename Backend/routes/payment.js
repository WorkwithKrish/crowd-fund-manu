const config = require("../config");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

const express = require("express");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

const router = express.Router();
const ctrl = require("../controllers");
const { Donation } = require("../models");

const razorpay = new Razorpay({
  key_id: config.RazorpayConfig.keyId,
  key_secret: config.RazorpayConfig.keySecret,
});

router.post("/:id/payment", [parseUrl, parseJson], async (req, res) => {
  if (!req.body.amount || req.body.amount <= 0) {
    return res.status(400).json({ message: "Please enter a valid amount!" });
  }

  const donationData = {
    amount: req.body.amount,
    campaign: req.params.id,
  };

  if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
    donationData.donor = req.body.userId;
  }

  try {
    const donation = new Donation(donationData);
    await donation.save();

    const options = {
      amount: req.body.amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: donation._id.toString(),
      notes: {
        donationId: donation._id.toString(),
        campaignId: req.params.id,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.RazorpayConfig.keyId,
      donationId: donation._id.toString(),
    });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({ message: "Error creating payment order" });
  }
});

router.post("/verify", ctrl.payment.verify);

module.exports = router;
