const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../middleware/error");

const router = express.Router();

// Slows down password guessing on login / sign up only
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later" },
});

const signToken = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

// Emails listed in ADMIN_EMAILS (comma separated) become admins automatically
const isAdminEmail = (email) =>
    (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
        .includes(String(email).toLowerCase());

router.post(
    "/register",
    authLimiter,
    asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            throw new HttpError(400, "Username, email and password are required");
        }

        const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (existing) throw new HttpError(400, "An account with this email already exists");

        const user = await User.create({
            username,
            email,
            password,
            role: isAdminEmail(email) ? "admin" : "user",
            lastLogin: new Date(),
            loginCount: 1,
        });

        res.status(201).json({
            message: "User registered successfully",
            token: signToken(user),
            user,
        });
    })
);

router.post(
    "/login",
    authLimiter,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) throw new HttpError(400, "Email and password are required");

        const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
        if (!user || !(await user.matchPassword(password))) {
            throw new HttpError(401, "Invalid email or password");
        }
        if (user.isBlocked) throw new HttpError(403, "Your account has been blocked");

        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        if (isAdminEmail(user.email)) user.role = "admin";
        await user.save();

        res.json({ message: "Login successful", token: signToken(user), user });
    })
);

router.get("/me", protect, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
