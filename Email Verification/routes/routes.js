const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const User = require('../model/model')
const Token = require('../model/token')


const route = express.Router()
route.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.isVerified
                    ? "Email already exists"
                    : "Email exists, verification pending"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        const tokenValue = crypto.randomBytes(32).toString("hex");
        const token = new Token({
            userId: newUser._id,
            token: tokenValue
        });
        await token.save();
        const verifyUrl = `${req.protocol}://${req.get("host")}/verify/${newUser._id}/${tokenValue}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: "Email Verification",
            html: `<h3>Verify Email</h3>
                   <p>Click the link below:</p>
                   <a href="${verifyUrl}">${verifyUrl}</a>`
        });
        res.status(201).json({
            message: "Registration successful. Verification email sent."
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* VERIFY EMAIL */
route.get('/verify/:userId/:token', async (req, res) => {
    try {
        const { userId, token } = req.params;

        // Check whether token exists
        
        const tokenData = await Token.findOne({ userId, token });
        if (!tokenData) {
            return res.status(400).json({
                error: "Invalid or expired token"
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Verify user
        user.isVerified = true;
        await user.save();

        // Delete token after verification
        await Token.deleteOne({ _id: tokenData._id });

        res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = route;
