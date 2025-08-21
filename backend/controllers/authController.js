const User = require("../models/timeSheetUsers");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Register
exports.register = async (req, res) => {
    try {
        const { name, employeeId, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Explicitly include role, defaulting to "employee" if not provided
        const user = await User.create({
            name,
            employeeId,
            email,
            password,
            role: role || "employee"
        });

        res.status(201).json({
            token: generateToken(user._id),
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await user.matchPassword(password)) {
            res.json({ token: generateToken(user._id), user });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get All Users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -resetCode -resetCodeExpiry");
        // Exclude sensitive fields
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = resetCode;
        user.resetCodeExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Code",
            text: `Your reset code is ${resetCode}. It expires in 10 minutes.`
        });

        res.json({ success: true, message: "Reset code sent to email" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify Code
exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.resetCode !== code || Date.now() > user.resetCodeExpiry) {
            return res.status(400).json({ message: "Invalid or expired code" });
        }

        res.json({ message: "Code verified successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.resetCode !== code || Date.now() > user.resetCodeExpiry) {
            return res.status(400).json({ message: "Invalid or expired code" });
        }

        user.password = newPassword;
        user.resetCode = null;
        user.resetCodeExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
