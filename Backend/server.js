// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const app = express();

// // -----ENV Setup----- //
// require("dotenv").config();
// const PORT = 4000;
// const routes = require("./routes");

// // -----Middleware----- /
// app.use(cors());
// app.use(bodyParser.json());

// // -----Routes----- //
// // app.get("/", (req, res) => {
// //   res.sendFile(__dirname + "/index.html");
// // });

// app.use("/api/campaign", routes.campaign);
// app.use("/api/user", routes.user);
// app.use("/api/donate", routes.payment);
// app.use("/api/donation", routes.donation);
// app.use("/api/query", routes.query);

// app.get("*", function (req, res) {
//   res.send("404 Error");
// });

// app.listen(PORT, function () {
//   console.log("Server running successfully");
// });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 4000;

// Connect DB and setup cleanup
require("./models");

// Cleanup expired campaigns every hour
setInterval(async () => {
  try {
    const db = require("./models");
    const result = await db.Campaign.deleteMany({
      daysLeft: { $lte: 0 }
    });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Auto-deleted ${result.deletedCount} expired campaigns`);
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}, 60 * 60 * 1000);

// Decrement daysLeft daily
setInterval(async () => {
  try {
    const db = require("./models");
    const result = await db.Campaign.updateMany(
      { daysLeft: { $gt: 0 } },
      { $inc: { daysLeft: -1 } }
    );
    if (result.modifiedCount > 0) {
      console.log(`📅 Updated ${result.modifiedCount} campaigns - days left decremented`);
    }
  } catch (err) {
    console.error("Days decrement error:", err);
  }
}, 24 * 60 * 60 * 1000); // Every 24 hours

// -----Routes----- //
const routes = require("./routes");

// -----Middleware----- //
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -----API Routes----- //
app.use("/api/campaign", routes.campaign);
app.use("/api/user", routes.user);
app.use("/api/donate", routes.payment);
app.use("/api/donation", routes.donation);
app.use("/api/query", routes.query);

app.get("/", (req, res) => {
  res.sendFile(require("path").join(__dirname, "index.html"));
});

// -----404----- //
app.use((req, res) => {
  res.status(404).send("404 Error");
});

// -----Server----- //
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
