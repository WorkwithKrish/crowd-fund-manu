const express = require("express");
const router = express.Router();
const ctrl = require("../controllers");
const db = require("../models");

router.get("/all", ctrl.campaign.showAll);
router.get("/:id", ctrl.campaign.show);

router.post("/reset/:id", async (req, res) => {
  try {
    await db.Campaign.findByIdAndUpdate(req.params.id, {
      raisedAmount: 0,
      donorsNum: 0
    });
    res.status(200).json({ message: "Campaign reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
});

router.delete("/cleanup/expired", async (req, res) => {
  try {
    const result = await db.Campaign.deleteMany({
      daysLeft: { $lte: 0 }
    });
    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} expired campaigns` 
    });
  } catch (err) {
    res.status(500).json({ message: "Cleanup failed" });
  }
});

module.exports = router;