require("dotenv").config();

var RazorpayConfig = {
  keyId: process.env.RAZORPAY_KEY,
  keySecret: process.env.RAZORPAY_SECRET,
};
module.exports.RazorpayConfig = RazorpayConfig;
