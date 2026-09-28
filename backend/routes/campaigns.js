const express = require("express");
const crypto = require("crypto");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Post = require("../models/Post");
const { protect, canModify } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../middleware/error");
const { getPagination, searchFilter, pick, AUTHOR_FIELDS } = require("../utils/query");

const router = express.Router();

const EDITABLE = ["title", "summary", "story", "category", "goal", "image", "location", "deadline", "status"];

const SORTS = {
    newest: { createdAt: -1 },
    popular: { donationCount: -1, createdAt: -1 },
    funded: { raised: -1 },
    ending: { deadline: 1 },
};

// Hide donor identity on anonymous donations
const publicDonation = (d) => ({
    _id: d._id,
    amount: d.amount,
    message: d.message,
    anonymous: d.anonymous,
    createdAt: d.createdAt,
    donor: d.anonymous ? null : d.donor,
});

router.get("/categories", (req, res) => {
    res.json(Campaign.CATEGORIES);
});

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const { search, category, status, creator, sort } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const filter = { ...searchFilter(search, ["title", "summary", "location"]) };
        if (category && category !== "All") filter.category = category;
        if (status && status !== "all") filter.status = status;
        if (creator) filter.creator = creator;
        if (sort === "ending") filter.deadline = { $gte: new Date() };

        const [campaigns, total] = await Promise.all([
            Campaign.find(filter)
                .select("-story")
                .populate("creator", AUTHOR_FIELDS)
                .sort(SORTS[sort] || SORTS.newest)
                .skip(skip)
                .limit(limit),
            Campaign.countDocuments(filter),
        ]);

        res.json({ campaigns, total, page, pages: Math.ceil(total / limit) || 1 });
    })
);

router.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const campaign = await Campaign.findById(req.params.id).populate("creator", AUTHOR_FIELDS);
        if (!campaign) throw new HttpError(404, "Campaign not found");

        const [donations, updates] = await Promise.all([
            Donation.find({ campaign: campaign._id, status: "completed" })
                .populate("donor", "username avatar")
                .sort({ createdAt: -1 })
                .limit(20),
            Post.find({ campaign: campaign._id })
                .select("-comments")
                .populate("author", "username avatar")
                .sort({ createdAt: -1 }),
        ]);

        res.json({ campaign, donations: donations.map(publicDonation), updates });
    })
);

router.post(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const data = pick(req.body, EDITABLE);
        delete data.status;
        const campaign = await Campaign.create({ ...data, creator: req.user._id });
        res.status(201).json(campaign);
    })
);

router.put(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) throw new HttpError(404, "Campaign not found");
        if (!canModify(req.user, campaign.creator)) {
            throw new HttpError(403, "You can only edit your own campaigns");
        }

        Object.assign(campaign, pick(req.body, EDITABLE));
        await campaign.save();
        res.json(campaign);
    })
);

router.delete(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) throw new HttpError(404, "Campaign not found");
        if (!canModify(req.user, campaign.creator)) {
            throw new HttpError(403, "You can only delete your own campaigns");
        }
        // Donation records are kept for accountability; owners close funded campaigns instead
        if (campaign.donationCount > 0 && req.user.role !== "admin") {
            throw new HttpError(400, "This campaign has received donations. Close it instead of deleting it.");
        }

        await Promise.all([
            Donation.deleteMany({ campaign: campaign._id }),
            Post.updateMany({ campaign: campaign._id }, { $unset: { campaign: 1 } }),
            campaign.deleteOne(),
        ]);
        res.json({ message: "Campaign deleted" });
    })
);

router.post(
    "/:id/donate",
    protect,
    asyncHandler(async (req, res) => {
        const amount = Math.round(Number(req.body.amount) * 100) / 100;
        if (!Number.isFinite(amount) || amount < 1) {
            throw new HttpError(400, "Please enter a valid amount (minimum 1)");
        }

        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) throw new HttpError(404, "Campaign not found");
        if (campaign.status !== "active") throw new HttpError(400, "This campaign is no longer accepting donations");
        if (campaign.deadline && campaign.deadline < new Date()) {
            throw new HttpError(400, "This campaign's deadline has passed");
        }

        const donation = await Donation.create({
            campaign: campaign._id,
            donor: req.user._id,
            amount,
            message: req.body.message || "",
            anonymous: Boolean(req.body.anonymous),
            paymentMethod: req.body.paymentMethod || "card",
            reference: "UT-" + crypto.randomBytes(5).toString("hex").toUpperCase(),
        });

        const updated = await Campaign.findByIdAndUpdate(
            campaign._id,
            { $inc: { raised: amount, donationCount: 1 } },
            { new: true }
        );

        res.status(201).json({ message: "Thank you for your donation!", donation, campaign: updated });
    })
);

module.exports = router;
