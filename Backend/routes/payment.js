const config = require("../config");

const backendURL = process.env.BACKEND_URL || "http://localhost:4000/";

const express = require("express");
const PaytmChecksum = require("paytmchecksum");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

const router = express.Router();
const ctrl = require("../controllers");
const { Donation } = require("../models");

router.post("/:id/payment", [parseUrl, parseJson], (req, res) => {
  var donationData = {
    amount: req.body.amount,
    campaign: req.params.id,
  };

  if (req.body.userId) {
    donationData.donor = req.body.userId;
  }

  var donation = new Donation(donationData);

  donation
    .save()
    .then(() => {
      if (!req.body.amount || req.body.amount <= 0) {
        return res.status(400).send("Please enter the amount!");
      }

      var params = {};
      params["MID"] = config.PaytmConfig.mid;
      params["ORDER_ID"] = donation._id.toString();
      params["CUST_ID"] = donation._id.toString();
      params["TXN_AMOUNT"] = req.body.amount.toString();
      params["CHANNEL_ID"] = "WEB";
      params["INDUSTRY_TYPE_ID"] = "Retail";
      params["WEBSITE"] = config.PaytmConfig.website;
      params["CALLBACK_URL"] = backendURL + "api/donate/success";
      params["EMAIL"] = "";
      params["MOBILE_NO"] = "";

      console.log("Paytm Config:", config.PaytmConfig);

      PaytmChecksum.generateSignature(params, config.PaytmConfig.key)
        .then(function (checksum) {
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction";

          console.log("Checksum:", checksum);

          var form_fields = "";
          for (var x in params) {
            form_fields +=
              '<input name="' + x + '" value="' + params[x] + '" type="hidden" />';
          }
          form_fields += '<input name="CHECKSUMHASH" value="' + checksum + '" type="hidden" />';

          var html =
            '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
            txn_url +
            '" name="f1">' +
            form_fields +
            '</form><script type="text/javascript">document.f1.submit();</script></body></html>';

          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(html);
          res.end();
        })
        .catch(function (err) {
          console.log("Error generating checksum:", err);
          res.status(500).send("Error generating checksum");
        });
    })
    .catch((err) => {
      console.log("Error:", err);
      return res.status(500).json({ message: "Error saving donation" });
    });
});

router.post("/success", ctrl.payment.success);

module.exports = router;
