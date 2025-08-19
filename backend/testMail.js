// testMail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendMail() {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to yourself
            subject: "✅ Nodemailer Test",
            text: "If you see this, email is working!",
        });
        console.log("Mail sent:", info.response);
    } catch (err) {
        console.error("Mail error:", err);
    }
}

sendMail();
