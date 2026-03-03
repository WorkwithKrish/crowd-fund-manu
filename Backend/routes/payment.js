const config = require("../config");
const mongoose = require("mongoose");

const rawBackendURL = process.env.BACKEND_URL || "http://localhost:4000";
const backendURL = rawBackendURL.endsWith("/") ? rawBackendURL : rawBackendURL + "/";

const express = require("express");
const PaytmChecksum = require("paytmchecksum");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

const router = express.Router();
const ctrl = require("../controllers");
const { Donation } = require("../models");

router.post("/:id/payment", [parseUrl, parseJson], (req, res) => {
  if (!req.body.amount || req.body.amount <= 0) {
    return res.status(400).json({ message: "Please enter a valid amount!" });
  }

  var donationData = {
    amount: req.body.amount,
    campaign: req.params.id,
  };

  if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
    donationData.donor = req.body.userId;
  }

  var donation = new Donation(donationData);

  donation
    .save()
    .then(() => {
      // Paytm requires parameters - using official format
      var paytmParams = {};
      paytmParams["MID"] = config.PaytmConfig.mid;
      paytmParams["WEBSITE"] = config.PaytmConfig.website;
      paytmParams["ORDER_ID"] = donation._id.toString();
      paytmParams["CUST_ID"] = donation._id.toString();
      paytmParams["TXN_AMOUNT"] = req.body.amount.toString();
      paytmParams["CALLBACK_URL"] = backendURL + "api/donate/success";
      paytmParams["CHANNEL_ID"] = "WEB";
      paytmParams["INDUSTRY_TYPE_ID"] = "Retail";
      paytmParams["EMAIL"] = "";
      paytmParams["MOBILE_NO"] = "";

      console.log("Paytm Config MID:", config.PaytmConfig.mid);
      console.log("Callback URL:", paytmParams["CALLBACK_URL"]);

      PaytmChecksum.generateSignature(paytmParams, config.PaytmConfig.key)
        .then(function (checksum) {
          // Using Paytm staging processTransaction URL
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction";

          console.log("Generated Checksum:", checksum);

          res.status(200).json({
            txn_url: txn_url,
            params: { ...paytmParams, CHECKSUMHASH: checksum },
          });
        })
        .catch(function (err) {
          console.log("Error generating checksum:", err);
          res.status(500).json({ message: "Error generating checksum" });
        });
    })
    .catch((err) => {
      console.log("Error:", err);
      return res.status(500).json({ message: "Error saving donation" });
    });
});

router.post("/success", ctrl.payment.success);

module.exports = router;
