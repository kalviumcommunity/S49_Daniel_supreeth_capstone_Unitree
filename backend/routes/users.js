const express = require("express");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Post = require("../models/Post");
const Item = require("../models/Item");
const { protect } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../middleware/error");
const { pick, AUTHOR_FIELDS } = require("../utils/query");

const router = express.Router();

// Public list of members (no private fields)
router.get(
    "/",
    asyncHandler(async (req, res) => {
        const users = await User.find({ isBlocked: false })
            .select(AUTHOR_FIELDS)
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(users);
    })
);

router.put(
    "/me",
    protect,
    asyncHandler(async (req, res) => {
        const updates = pick(req.body, ["username", "email", "bio", "location", "phone", "avatar"]);

        if (updates.email) {
            updates.email = String(updates.email).toLowerCase().trim();
            const taken = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
            if (taken) throw new HttpError(400, "That email is already in use");
        }

        Object.assign(req.user, updates);
        await req.user.save();
        res.json({ message: "Profile updated", user: req.user });
    })
);

router.put(
    "/me/password",
    protect,
    asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new HttpError(400, "Current and new password are required");
        }

        const user = await User.findById(req.user._id).select("+password");
        if (!(await user.matchPassword(currentPassword))) {
            throw new HttpError(400, "Current password is incorrect");
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password changed" });
    })
);

// Deletes an account (the user themself, or an admin).
// Donation records are kept for accountability; funded campaigns are closed instead of deleted.
router.delete(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const id = req.params.id === "me" ? String(req.user._id) : req.params.id;
        if (id !== String(req.user._id) && req.user.role !== "admin") {
            throw new HttpError(403, "You can only delete your own account");
        }

        const user = await User.findById(id);
        if (!user) throw new HttpError(404, "User not found");

        await Promise.all([
            Post.deleteMany({ author: user._id }),
            Item.deleteMany({ donor: user._id }),
            Item.updateMany(
                { claimedBy: user._id, status: "claimed" },
                { status: "available", $unset: { claimedBy: 1, claimedAt: 1 }, claimMessage: "" }
            ),
            Post.updateMany({}, { $pull: { likes: user._id, comments: { author: user._id } } }),
            Campaign.deleteMany({ creator: user._id, donationCount: 0 }),
            Campaign.updateMany({ creator: user._id }, { status: "closed" }),
        ]);
        await user.deleteOne();

        res.json({ message: "User deleted successfully" });
    })
);

// Public profile with the user's activity
router.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id).select(AUTHOR_FIELDS + " isBlocked");
        if (!user || user.isBlocked) throw new HttpError(404, "User not found");

        const [campaigns, posts, items, donationStats] = await Promise.all([
            Campaign.find({ creator: user._id }).sort({ createdAt: -1 }),
            Post.find({ author: user._id }).select("-comments").sort({ createdAt: -1 }),
            Item.find({ donor: user._id }).sort({ createdAt: -1 }),
            Donation.aggregate([
                { $match: { donor: user._id, anonymous: false, status: "completed" } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            user,
            campaigns,
            posts,
            items,
            donations: {
                total: donationStats[0]?.total || 0,
                count: donationStats[0]?.count || 0,
            },
        });
    })
);

module.exports = router;
