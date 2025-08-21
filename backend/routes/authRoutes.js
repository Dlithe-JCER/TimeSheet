const express = require("express");
const { register, login, forgotPassword, verifyCode, resetPassword, getUsers } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);
router.get("/users", getUsers);

module.exports = router;
