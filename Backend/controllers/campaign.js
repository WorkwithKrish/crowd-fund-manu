const db = require("../models");

// The below code is only for development stage
// To add some default items in our DB (Campaign collection) and check the api
const item1 = new db.Campaign({
  title: "test1",
  subTitle: "Test Subtitle 1",
  description:
    "test1dloren jhbvsd  bjbdsv chjb cdbhb bsdcb nb hg asnb hj  asbhbsjhbjhhjaxvhgbcas  hg.sahgvbcshgnbsa ghcsab hjasbjhabs  asbjh sx hahs bscjh",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 500,
  start: "2020-12-22T11:18:54.919Z",
});

const item2 = new db.Campaign({
  title: "test2",
  subTitle: "Test Subtitle 2",
  description:
    "test2dloren jhbvsd  bjbdsv chjb cdbhb bsdcb nb hg asnb hj  asbhbsjhbjhhjaxvhgbcas  hg.sahgvbcshgnbsa ghcsab hjasbjhabs  asbjh sx hahs bscjh",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 100,
  start: "2020-12-20T11:18:54.919Z",
});

const item3 = new db.Campaign({
  title: "test3",
  subTitle: "Test Subtitle 3",
  description:
    "test3dloren jhbvsd  bjbdsv chjb cdbhb bsdcb nb hg asnb hj  asbhbsjhbjhhjaxvhgbcas  hg.sahgvbcshgnbsa ghcsab hjasbjhabs  asbjh sx hahs bscjh",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 5000,
  start: "2020-12-19T11:18:54.919Z",
});

const item4 = new db.Campaign({
  title: "test4",
  subTitle: "Test Subtitle 4",
  description:
    "test4dloren jhbvsd  bjbdsv chjb cdbhb bsdcb nb hg asnb hj  asbhbsjhbjhhjaxvhgbcas  hg.sahgvbcshgnbsa ghcsab hjasbjhabs  asbjh sx hahs bscjh",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 50000,
  start: "2020-12-22T11:19:54.919Z",
});

const defaultItems = [item1, item2, item3, item4];

db.Campaign.find()
  .exec()
  .then((results) => {
    var count = results.length;

    if (count == 0) {
      db.Campaign.insertMany(defaultItems)
        .then(() => {
          console.log(
            "Successfully added default items to Campaign collection in DB"
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  })
  .catch((err) => {
    console.log(err);
  });
// Till here ----------------------------------------------------------------------------------

function hideTransactionID(donors) {
  var i, j;
  text = "";

  for (i = 0; i < donors.length; i++) {
    var S = donors[i].transactionId;
    text = "";
    for (j = 0; j < S.length; j++) {
      if (j > 3 && j < S.length - 3) text = text + "X";
      else text = text + S[j];
    }

    donors[i].transactionId = text;
  }

  return;
}

const show = async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      let showCampaign = await db.Campaign.findById(req.params.id);

      if (showCampaign) {
        res.status(200).json(showCampaign);
      } else {
        res.status(404).json({
          message: "Page Not Found",
        });
      }
    } else {
      res.status(404).json({
        message: "Page Not Found.",
      });
    }
  } catch (err) {
    console.log("Server error.", err);
    return res.status(500).json({
      message: "Something wrong when getting the campaign",
    });
  }
};

const showAll = async (req, res) => {
  try {
    const allCampaign = await db.Campaign.find({}).sort({ start: -1 }).exec();
    res.status(200).json(allCampaign);
  } catch (err) {
    console.log("Server error.", err);
    return res.status(500).json({
      message: "Something went wrong when trying to get all campaign",
    });
  }
};

module.exports = {
  show,
  showAll,
};