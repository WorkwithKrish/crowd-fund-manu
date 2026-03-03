const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models");
require("dotenv").config();

// Ensure default users exist
async function ensureDefaultUsers() {
  try {
    const adminExists = await db.User.findOne({ email: "admin@test.com" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("abc", salt);
      await db.User.create({
        email: "admin@test.com",
        password: hash,
        name: "Admin",
        isVerified: true,
      });
      console.log("Admin user created");
    }

    const testUserExists = await db.User.findOne({ email: "manasansreeoffi@gmail.com" });
    if (!testUserExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("manasa@1154", salt);
      await db.User.create({
        email: "manasansreeoffi@gmail.com",
        password: hash,
        name: "Manasa",
        isVerified: true,
      });
      console.log("Test user created");
    }
  } catch (err) {
    console.error("Error ensuring default users:", err);
  }
}

ensureDefaultUsers();

//-------------------------------------------------------------------------------------------------------
// Validating email address and domain
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(email)) {
    //Email valid. Procees to test if it's from the right domain (Second argument is to check that the string ENDS with this domain, and that it doesn't just contain it)
    if (
      email.indexOf("@iiitm.ac.in", email.length - "@iiitm.ac.in".length) !== -1
    ) {
      //VALID
      //console.log("VALID");
      return true;
    }
  }
  return false;
}
//-------------------------------------------------------------------------------------------------------

const addAdmin = async (req, res) => {
  const userData = req.body;
  /* Validating Sign up Form */
  if (!userData.email || !userData.password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    //check for existing user account
    const foundUser = await db.User.findOne({ email: userData.email });

    if (!validateEmail(userData.email))
      return res.status(400).json({
        message: "You can only add admins having email of iiitm.ac.in domain",
      });

    //return error if account already exist
    if (foundUser)
      return res.status(400).json({
        message: "Email is already been registered.",
      });

    //if doesn't exist, we generate hash Salt ( make the password hard to crack)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userData.password, salt);

    const { email } = req.body;
    const newUser = {
      email: email,
      password: hash,
    };

    const createdUser = await db.User.create(newUser);

    jwt.sign(
      { foo: createdUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
      (err, token) => {
        if (err)
          return res.status(403).json({
            message: "Access forbidden",
          });
        res.status(200).json({
          message: "Admin added successfully.",
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, Please try again",
      error: err.message,
    });
  }
};
//-------------------------------------------------------------------------------------------------------
// Commented part includes email verification
/*
        db.User.create(newUser, (err, createdUser) => {
          if (err)
            return res.status(400).json({
              message: "Bad Request, Please try again",
              err: err.errmsg,
            });

          // generate token and save
          const token = new db.Token({
            _userId: createdUser._id,
            token: crypto.randomBytes(16).toString("hex"),
          });

          token.save(function (err) {
            if (err) {
              return res.status(500).send({ msg: "Please try again!" });
            }

            var smtpTransport = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASSWORD,
              },
            });

            var mailOptions = {
              to: createdUser.email,
              subject: "Account Verification Link",
              text:
                "Please verify your account by clicking the link: \nhttp://" +
                req.headers.host +
                "/api/user/confirmation/" +
                createdUser.email +
                "/" +
                token.token +
                "\n\nThank You!\n",
            };

            smtpTransport.sendMail(mailOptions, function (err) {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg:
                    "Technical Issue!, Please click on resend to verify your email.",
                });
              }
              return res
                .status(200)
                .send(
                  "A verification email has been sent to " +
                    createdUser.email +
                    ". It will expire after one day. If you haven't received the verification email, click on Resend Link button."
                );
            });
          });
        });
        */
//-------------------------------------------------------------------------------------------------------
// Commented part includes email verification
/*
const verify = (req, res) => {
  db.Token.findOne({ token: req.params.token }, function (err, token) {
    // token is not found into database i.e. token may have expired
    if (!token) {
      return res.status(400).send({
        msg:
          "Your verification link may have expired. Please click on resend to verify your Email.",
      });
    }
    // if token is found then check valid user
    else {
      db.User.findOne(
        { _id: token._userId, email: req.params.email },
        function (err, user) {
          // not valid user
          if (!user) {
            return res.status(401).send({
              msg:
                "We were unable to find a user for this verification. Please SignUp!",
            });
          }
          // user is already verified
          else if (user.isVerified) {
            return res
              .status(200)
              .send("User has been already verified. Please Login");
          }
          // verify user
          else {
            // change isVerified to true
            user.isVerified = true;
            user.save(function (err) {
              // error occur
              if (err) {
                return res.status(500).send({ msg: "Please try again!" });
              }
              // account successfully verified
              else {
                return res
                  .status(200)
                  .send("Your account has been successfully verified");
              }
            });
          }
        }
      );
    }
  });
};
//-------------------------------------------------------------------------------------------------------

const resend = (req, res) => {
  db.User.findOne({ email: req.body.email }, function (err, user) {
    // user is not found into database
    if (!user) {
      return res.status(400).send({
        msg:
          "We were unable to find a user with that email. Make sure your email is correct!",
      });
    }
    // user has been already verified
    else if (user.isVerified) {
      return res
        .status(200)
        .send("This account has been already verified. Please log in.");
    }
    // send verification link
    else {
      // generate token and save
      const token = new db.Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });

      token.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: "Please try again!" });
        }

        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        var mailOptions = {
          from: "no-reply@example.com",
          to: user.email,
          subject: "Account Verification Link",
          text:
            "Please verify your account by clicking the link: \nhttp://" +
            req.headers.host +
            "/api/user/confirmation/" +
            user.email +
            "/" +
            token.token +
            "\n\nThank You!\n",
        };

        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) {
            return res.status(500).send({
              msg:
                "Technical Issue!, Please click on resend to verify your email.",
            });
          }
          return res
            .status(200)
            .send(
              "A verification email has been sent to " +
                user.email +
                ". It will expire after one day. If you haven't received the verification email, click on Resend Link token."
            );
        });
      });
    }
  });
};
//-------------------------------------------------------------------------------------------------------
*/

const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Please enter both your email and password",
    });
  }

  try {
    const foundUser = await db.User.findOne({ email: req.body.email });

    // Allow any email for testing (remove domain restriction)
    // if (!validateEmail(req.body.email))
    //   return res.status(400).json({
    //     message: "Please login with email of iiitm.ac.in domain",
    //   });

    if (!foundUser) {
      return res.status(400).json({
        message:
          "Email address is not associated with any account. Please check and try again",
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, foundUser.password);

    if (isMatch) {
      /* jwt */
      jwt.sign(
        { foo: foundUser._id, email: foundUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "10h" },
        (err, token) => {
          if (err)
            return res.status(403).json({
              message: "Access Forbidden",
            });
          res.status(200).json({ jwt: token, userId: foundUser._id });
        }
      );
    } else {
      return res.status(400).json({
        message: "Email or Password is not correct.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong. Please try again",
    });
  }
};
//-------------------------------------------------------------------------------------------------------
/* Commented part includes forgot,reset password functionality

const forgotPassword = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      status: 400,
      errors: [
        {
          message: "Please enter your email address linked with your account.",
        },
      ],
    });
  }

  const { email } = req.body;

  await db.User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist." });
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "20m",
    });

    var mailOptions = {
      from: "no-reply@example.com",
      to: email,
      subject: "Reset Password Link",
      text:
        "Please click on the given link to reset your password: \nhttp://" +
        req.headers.host +
        "/api/user/resetPassword/" +
        token +
        "\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nThank You!\n",
    };

    return user.updateOne({ resetLink: token }, function (err, success) {
      if (err) {
        return res.status(400).json({ error: "Reset Password Link error" });
      }

      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.GMAIL_ID,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      smtpTransport.sendMail(mailOptions, function (err) {
        if (err) {
          return res.status(500).send({
            msg: "Technical Issue!, Please try again.",
          });
        }
        return res
          .status(200)
          .send(
            "Password Reset Link has been sent to your email " +
              email +
              ". It will expire after 20 minutes. If you haven't received the email, please try again."
          );
      });
    });
  });
};
//-------------------------------------------------------------------------------------------------------

const resetPassword = async (req, res) => {
  if (!req.body.newPassword) {
    return res.status(400).json({
      status: 400,
      errors: [
        {
          message: "Enter your new password.",
        },
      ],
    });
  }

  const { newPassword, resetLink } = req.body;

  if (resetLink) {
    jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (err, data) {
      if (err) {
        return res.status(401).json({ error: "Incorrect token or expired!" });
      }

      db.User.findOne({ resetLink }, (err, user) => {
        if (err || !user) {
          return res.status(401).json({
            error: "User with this token does not exist or Token has expired",
          });
        }

        // Hash the new password
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return res
              .status(400)
              .json({ message: "Something went wrong, try again1" });
          }

          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) {
              return res
                .status(400)
                .json({ message: "Something went wrong, try again2" });
            }

            db.User.findOneAndUpdate(
              { _id: user._id },
              { $set: { password: hash, resetLink: "" } },
              function (err, success) {
                if (err) {
                  return res.status(400).json({
                    message: "Password Update Error, please try again",
                  });
                }

                return res.status(200).json({
                  message:
                    "Password Changed Successfully. Please login with the new password.",
                });
              }
            );
          });
        });
      });
    });
  } else {
    return res.status(401).json({ error: "Authentication error" });
  }
};
//-------------------------------------------------------------------------------------------------------
*/

const create = async (req, res) => {
  // const user = req.curUserId;
  const campaign = { ...req.body, raised: 0 };

  if (!campaign.title || !campaign.description || !campaign.subTitle) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (campaign.required <= 0) {
    return res.status(400).json({
      message: "The required amount cannot be equal to or smaller than 0",
    });
  }

  try {
    const newCampaign = await db.Campaign.create(campaign);

    //console.log("newCampaign", newCampaign);
    res.status(200).json(newCampaign);
  } catch (err) {
    console.log("Server error.");
    return res.status(500).json({
      message: "Something went wrong when creating a new campaign",
    });
  }
};
//-------------------------------------------------------------------------------------------------------

const options = {
  // Return the document after updates are applied
  new: true,
  // Create a document if one isn't found. Required
  // for `setDefaultsOnInsert`
  upsert: true,
  setDefaultsOnInsert: true,
};

const update = async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      let updatedCampaign = await db.Campaign.findByIdAndUpdate(
        req.params.id,
        req.body,
        options
      );
      //console.log(updatedCampaign);
      res.status(200).json(updatedCampaign);
    } else {
      res.status(404).json({
        message: "No such campaign exists.",
      });
    }
  } catch (err) {
    console.log("Server error.");
    return res.status(500).json({
      message: "Something went wrong while updating campaign. Try again.",
    });
  }
};
//-------------------------------------------------------------------------------------------------------

const deleteCampaign = async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      await db.Campaign.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        message: "Successfully deleted the campaign.",
      });
    } else {
      res.status(404).json({
        message: "No such campaign exists.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong while deleting campaign. Try again.",
    });
  }
};

//-------------------------------------------------------------------------------------------------------
const register = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Allow any email for testing (remove domain restriction)
  // if (!validateEmail(email)) {
  //   return res.status(400).json({
  //     message: "You can only register with iiitm.ac.in domain",
  //   });
  // }

  try {
    const foundUser = await db.User.findOne({ email });

    if (foundUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = { email, password: hash, name: name || email.split('@')[0] };
    const createdUser = await db.User.create(newUser);

    jwt.sign(
      { foo: createdUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
      (err, token) => {
        if (err) {
          return res.status(403).json({ message: "Access Forbidden" });
        }
        res.status(200).json({ jwt: token, userId: createdUser._id });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//-------------------------------------------------------------------------------------------------------
module.exports = {
  addAdmin,
  login,
  register,
  create,
  update,
  deleteCampaign,
};