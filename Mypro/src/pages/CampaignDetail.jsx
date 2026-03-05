import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/campaign/${id}`);
      setCampaign(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to donate");
      return;
    }

    if (!donationAmount || donationAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await axios.post(
        `http://localhost:4000/api/donate/${id}/payment`,
        {
          amount: parseFloat(donationAmount),
          userId: userData._id,
        }
      );

      const { orderId, amount, currency, keyId, donationId } = res.data;

      if (orderId && keyId) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "Crowdfund",
          description: "Donation to Campaign",
          order_id: orderId,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(
                `http://localhost:4000/api/donate/verify`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  donationId: donationId,
                }
              );

              if (verifyRes.data.success) {
                window.location.href = `/donation/success/${donationId}`;
              } else {
                window.location.href = `/donation/failure`;
              }
            } catch (err) {
              console.error(err);
              window.location.href = `/donation/failure`;
            }
          },
          prefill: {
            name: userData.name || "",
            email: userData.email || "",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on("payment.failed", function (response) {
          window.location.href = `/donation/failure`;
        });
      } else {
        alert("Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!campaign) return <div className="error">Campaign not found</div>;

  const progress =
    campaign.required > 0
      ? Math.min((campaign.raisedAmount / campaign.required) * 100, 100)
      : 0;

  const goalReached = campaign.raisedAmount >= campaign.required;

  return (
    <div className="campaign-detail">
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>

      <div className="campaign-header">
        <img
          src={
            campaign.image ||
            campaign.imageUrl ||
            "https://via.placeholder.com/800x400"
          }
          alt={campaign.title}
        />
      </div>

      <div className="campaign-info">
        <h1>{campaign.title}</h1>
        <p className="subtitle">{campaign.subTitle}</p>
        <p className="description">{campaign.description}</p>

        <div className="campaign-progress">
          <div className="progress-bar large">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="stats">
            <div>
              <span className="stat-value">
                ${campaign.raisedAmount?.toLocaleString() || 0}
              </span>
              <span className="stat-label">
                raised of ${campaign.required?.toLocaleString() || 0}
              </span>
            </div>
            <div>
              <span className="stat-value">{campaign.donorsNum || 0}</span>
              <span className="stat-label">donors</span>
            </div>
            <div>
              <span className="stat-value">{campaign.daysLeft || 0}</span>
              <span className="stat-label">days left</span>
            </div>
          </div>
        </div>

        {!goalReached ? (
          <form onSubmit={handleDonate} className="donate-form">
            <input
              type="number"
              placeholder="Enter amount ($)"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              min="1"
              required
            />
            <button type="submit" disabled={processing}>
              {processing ? "Processing..." : "Donate Now"}
            </button>
          </form>
        ) : (
          <div className="goal-complete">
            Thank you all donors! Goal has been achieved.
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignDetail;
