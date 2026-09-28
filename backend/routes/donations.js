const express = require("express");
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();

// Donations the logged-in user has made
router.get(
    "/mine",
    protect,
    asyncHandler(async (req, res) => {
        const donations = await Donation.find({ donor: req.user._id })
            .populate("campaign", "title image status")
            .sort({ createdAt: -1 });
        res.json(donations);
    })
);

// Donations made to the logged-in user's campaigns
router.get(
    "/received",
    protect,
    asyncHandler(async (req, res) => {
        const campaignIds = await Campaign.find({ creator: req.user._id }).distinct("_id");
        const donations = await Donation.find({ campaign: { $in: campaignIds } })
            .populate("campaign", "title")
            .populate("donor", "username email avatar")
            .sort({ createdAt: -1 });

        res.json(
            donations.map((d) => {
                const obj = d.toObject();
                if (obj.anonymous) obj.donor = null;
                return obj;
            })
        );
    })
);

module.exports = router;
