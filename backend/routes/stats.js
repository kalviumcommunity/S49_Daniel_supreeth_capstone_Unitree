const express = require("express");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Post = require("../models/Post");
const Item = require("../models/Item");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();

// Public platform totals for the home page
router.get(
    "/",
    asyncHandler(async (req, res) => {
        const [users, campaigns, posts, itemsDonated, itemsListed, totals] = await Promise.all([
            User.countDocuments(),
            Campaign.countDocuments(),
            Post.countDocuments(),
            Item.countDocuments({ status: "donated" }),
            Item.countDocuments(),
            Donation.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, raised: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
        ]);

        res.json({
            users,
            campaigns,
            posts,
            itemsDonated,
            itemsListed,
            raised: totals[0]?.raised || 0,
            donations: totals[0]?.count || 0,
        });
    })
);

module.exports = router;
