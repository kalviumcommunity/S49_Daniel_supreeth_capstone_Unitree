const express = require("express");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Post = require("../models/Post");
const Item = require("../models/Item");
const { protect, adminOnly } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../middleware/error");

const router = express.Router();

router.use(protect, adminOnly);

const countBy = (Model, field, match = {}) =>
    Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);

router.get(
    "/overview",
    asyncHandler(async (req, res) => {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [users, campaigns, posts, items, totals, daily, recentDonations, recentUsers] = await Promise.all([
            User.countDocuments(),
            Campaign.countDocuments(),
            Post.countDocuments(),
            Item.countDocuments(),
            Donation.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, raised: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Donation.aggregate([
                { $match: { createdAt: { $gte: since }, status: "completed" } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        amount: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Donation.find()
                .populate("donor", "username email")
                .populate("campaign", "title")
                .sort({ createdAt: -1 })
                .limit(10),
            User.find().sort({ createdAt: -1 }).limit(5),
        ]);

        res.json({
            counts: { users, campaigns, posts, items },
            raised: totals[0]?.raised || 0,
            donations: totals[0]?.count || 0,
            daily,
            recentDonations,
            recentUsers,
        });
    })
);

// Every user with their activity totals
router.get(
    "/users",
    asyncHandler(async (req, res) => {
        const [users, campaigns, posts, items, donated] = await Promise.all([
            User.find().sort({ createdAt: -1 }),
            countBy(Campaign, "creator"),
            countBy(Post, "author"),
            countBy(Item, "donor"),
            Donation.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: "$donor", total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
        ]);

        const toMap = (rows) => new Map(rows.map((r) => [String(r._id), r]));
        const [cMap, pMap, iMap, dMap] = [campaigns, posts, items, donated].map(toMap);

        res.json(
            users.map((u) => {
                const id = String(u._id);
                return {
                    ...u.toJSON(),
                    stats: {
                        campaigns: cMap.get(id)?.count || 0,
                        posts: pMap.get(id)?.count || 0,
                        items: iMap.get(id)?.count || 0,
                        donations: dMap.get(id)?.count || 0,
                        donated: dMap.get(id)?.total || 0,
                    },
                };
            })
        );
    })
);

router.patch(
    "/users/:id",
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) throw new HttpError(404, "User not found");
        if (user._id.equals(req.user._id)) throw new HttpError(400, "You cannot change your own admin status");

        if (req.body.role !== undefined) user.role = req.body.role;
        if (req.body.isBlocked !== undefined) user.isBlocked = Boolean(req.body.isBlocked);
        await user.save();
        res.json(user);
    })
);

router.get(
    "/donations",
    asyncHandler(async (req, res) => {
        const donations = await Donation.find()
            .populate("donor", "username email")
            .populate("campaign", "title")
            .sort({ createdAt: -1 })
            .limit(500);
        res.json(donations);
    })
);

module.exports = router;
