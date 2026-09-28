const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, HttpError } = require("./error");

const readToken = (req) => {
    const header = req.header("Authorization") || "";
    if (!header) return null;
    return header.startsWith("Bearer ") ? header.slice(7) : header;
};

const loadUser = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
};

// Requires a valid token; sets req.user
const protect = asyncHandler(async (req, res, next) => {
    const token = readToken(req);
    if (!token) throw new HttpError(401, "Please log in to continue");

    const user = await loadUser(token);
    if (!user) throw new HttpError(401, "Session expired, please log in again");
    if (user.isBlocked) throw new HttpError(403, "Your account has been blocked");

    req.user = user;
    next();
});

// Sets req.user if a valid token is present, but never rejects
const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = readToken(req);
    if (token) {
        const user = await loadUser(token);
        if (user && !user.isBlocked) req.user = user;
    }
    next();
});

const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return next(new HttpError(403, "Admin access required"));
    }
    next();
};

// True when the current user owns the document (or is an admin)
const canModify = (user, ownerId) =>
    user && (user.role === "admin" || String(ownerId) === String(user._id));

module.exports = { protect, optionalAuth, adminOnly, canModify };
