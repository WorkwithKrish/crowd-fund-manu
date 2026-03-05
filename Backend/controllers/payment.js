const crypto = require("crypto");
const db = require("../models");
const config = require("../config");

const verify = async (req, res) => {
  console.log("=== Razorpay Payment Verification ===");
  console.log("req.body:", req.body);

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, donationId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !donationId) {
      console.error("Missing required payment verification data");
      return res.status(400).json({ success: false, message: "Missing payment verification data" });
    }

    const donation = await db.Donation.findOne({ _id: donationId }).populate('campaign');

    if (!donation) {
      console.error("Donation not found for ID:", donationId);
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    console.log("Found donation:", donation._id);
    donation.transactionId = razorpay_payment_id;

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", config.RazorpayConfig.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;
    console.log("Signature valid:", isSignatureValid);

    if (isSignatureValid) {
      console.log("Payment verified successful!");
      donation.transactionComplete = true;
      donation.status = 'completed';
      await donation.save();

      const campaign = await db.Campaign.findById(donation.campaign);
      if (campaign) {
        campaign.donors.push({
          transactionId: donation.transactionId,
          donationAmount: donation.amount,
          donor: donation.donor
        });
        campaign.donorsNum = (campaign.donorsNum || 0) + 1;
        campaign.raisedAmount = (campaign.raisedAmount || 0) + donation.amount;
        await campaign.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        donationId: donation._id,
      });
    } else {
      console.log("Signature verification failed");
      await donation.save();
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, message: "Server error during payment verification" });
  }
};

module.exports = {
  verify,
};