const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173/";

const PaytmChecksum = require("paytmchecksum");
const https = require("https");
const qs = require("querystring");
const db = require("../models");
const config = require("../config");

const success = async (req, res) => {
  try {
    var body = "";

    req.on("data", function (data) {
      body += data;
    });

    req.on("end", async function () {
      var post_data = qs.parse(body);

      const donation = await db.Donation.findOne({
        _id: post_data.ORDERID,
      }).populate('campaign');

      if (!donation) {
        return res.send("Transaction Failed, Please retry!!");
      }

      donation.transactionId = post_data.TXNID;

      if (post_data.RESPCODE == "01") {
        var params = post_data;
        var checkSumHash = params.CHECKSUMHASH;
        delete params.CHECKSUMHASH;

        var isVerifySignature = PaytmChecksum.verifySignature(params, config.PaytmConfig.key, checkSumHash);

        if (isVerifySignature) {
          PaytmChecksum.generateSignature(params, config.PaytmConfig.key).then(function (checksum) {
            params.CHECKSUMHASH = checksum;
            post_data = "JsonData=" + JSON.stringify(params);

            var options = {
              hostname: "securegw-stage.paytm.in",
              port: 443,
              path: "/merchant-status/getTxnStatus",
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": post_data.length,
              },
            };

            var response = "";
            var post_req = https.request(options, async function (post_res) {
              post_res.on("data", function (chunk) {
                response += chunk;
              });

              post_res.on("end", async function () {
                var _result = JSON.parse(response);
                
                if (
                  _result.STATUS == "TXN_SUCCESS" &&
                  _result.TXNAMOUNT == params.TXNAMOUNT &&
                  _result.ORDERID == params.ORDERID
                ) {
                  donation.transactionComplete = true;
                  donation.status = 'completed';
                  await donation.save();

                  const campaign = await db.Campaign.findById(donation.campaign);

                  if (campaign) {
                    var details = {
                      transactionId: donation.transactionId,
                      donationAmount: donation.amount,
                    };
                    
                    if (donation.donor) {
                      details.donor = donation.donor;
                    }

                    campaign.donors.push(details);
                    campaign.donorsNum = (campaign.donorsNum || 0) + 1;
                    campaign.raisedAmount = (campaign.raisedAmount || 0) + donation.amount;
                    await campaign.save();
                  }

                  res
                    .status(200)
                    .redirect(frontendURL + "donation/success/" + donation._id);
                } else {
                  await donation.save();
                  console.log("Payment Failed");
                  res.status(400).redirect(frontendURL + "donation/failure");
                }
              });
            });

            post_req.write(post_data);
            post_req.end();
          });
        } else {
          await donation.save();
          console.log("Payment Failed - Checksum mismatch");
          res.status(400).redirect(frontendURL + "donation/failure");
        }
      } else {
        await donation.save();
        console.log("Payment Failed - Response code: " + post_data.RESPCODE);
        res.status(400).redirect(frontendURL + "donation/failure");
      }
    });
  } catch (err) {
    console.log("Server error:", err);
    res.status(500).json({
      message: "Server error. Sorry from our end.",
    });
  }
};

module.exports = {
  success,
};