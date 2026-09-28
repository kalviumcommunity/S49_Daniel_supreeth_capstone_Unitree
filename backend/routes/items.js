const express = require("express");
const Item = require("../models/Item");
const { protect, optionalAuth, canModify } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../middleware/error");
const { getPagination, searchFilter, pick, AUTHOR_FIELDS } = require("../utils/query");

const router = express.Router();

const EDITABLE = ["name", "description", "category", "condition", "quantity", "location", "images"];

router.get("/categories", (req, res) => {
    res.json(Item.CATEGORIES);
});

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const { search, category, status, donor } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const filter = { ...searchFilter(search, ["name", "description", "location"]) };
        if (category && category !== "All") filter.category = category;
        if (donor) filter.donor = donor;
        // Default to items that can still be claimed
        if (status !== "all") filter.status = status || "available";

        const [items, total] = await Promise.all([
            Item.find(filter)
                .select("-claimMessage -claimedBy")
                .populate("donor", "username avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Item.countDocuments(filter),
        ]);

        res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
    })
);

// Items the logged-in user has claimed
router.get(
    "/claimed/me",
    protect,
    asyncHandler(async (req, res) => {
        const items = await Item.find({ claimedBy: req.user._id })
            .populate("donor", "username email phone avatar")
            .sort({ claimedAt: -1 });
        res.json(items);
    })
);

router.get(
    "/:id",
    optionalAuth,
    asyncHandler(async (req, res) => {
        const item = await Item.findById(req.params.id)
            .populate("donor", AUTHOR_FIELDS + " email phone")
            .populate("claimedBy", "username email phone avatar");
        if (!item) throw new HttpError(404, "Item not found");

        const obj = item.toObject();
        const isDonor = canModify(req.user, item.donor._id);
        const isClaimer = req.user && item.claimedBy && item.claimedBy._id.equals(req.user._id);

        // Contact details are only shared between the donor and the person who claimed it
        if (!isClaimer && !canModify(req.user, item.donor._id)) {
            delete obj.donor.email;
            delete obj.donor.phone;
        }
        if (!isDonor && !isClaimer) {
            delete obj.claimedBy;
            delete obj.claimMessage;
        }

        res.json(obj);
    })
);

router.post(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const item = await Item.create({ ...pick(req.body, EDITABLE), donor: req.user._id });
        res.status(201).json(item);
    })
);

router.put(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const item = await Item.findById(req.params.id);
        if (!item) throw new HttpError(404, "Item not found");
        if (!canModify(req.user, item.donor)) throw new HttpError(403, "You can only edit your own items");

        Object.assign(item, pick(req.body, EDITABLE));
        await item.save();
        res.json(item);
    })
);

router.delete(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const item = await Item.findById(req.params.id);
        if (!item) throw new HttpError(404, "Item not found");
        if (!canModify(req.user, item.donor)) throw new HttpError(403, "You can only delete your own items");

        await item.deleteOne();
        res.json({ message: "Item removed" });
    })
);

router.post(
    "/:id/claim",
    protect,
    asyncHandler(async (req, res) => {
        const item = await Item.findById(req.params.id);
        if (!item) throw new HttpError(404, "Item not found");
        if (item.donor.equals(req.user._id)) throw new HttpError(400, "You cannot claim your own item");

        // Atomic so two people can't claim the same item at once
        const claimed = await Item.findOneAndUpdate(
            { _id: item._id, status: "available" },
            {
                status: "claimed",
                claimedBy: req.user._id,
                claimMessage: String(req.body.message || "").slice(0, 500),
                claimedAt: new Date(),
            },
            { new: true }
        );
        if (!claimed) throw new HttpError(400, "Sorry, this item has already been claimed");

        res.json({ message: "Item claimed! The donor's contact details are now visible to you.", item: claimed });
    })
);

// Donor or claimer cancels a claim, making the item available again
router.post(
    "/:id/release",
    protect,
    asyncHandler(async (req, res) => {
        const item = await Item.findById(req.params.id);
        if (!item) throw new HttpError(404, "Item not found");
        const isClaimer = item.claimedBy && item.claimedBy.equals(req.user._id);
        if (!isClaimer && !canModify(req.user, item.donor)) throw new HttpError(403, "Not allowed");
        if (item.status !== "claimed") throw new HttpError(400, "Item is not currently claimed");

        item.status = "available";
        item.claimedBy = undefined;
        item.claimMessage = "";
        item.claimedAt = undefined;
        await item.save();
        res.json({ message: "Claim cancelled", item });
    })
);

// Donor confirms the item was handed over
router.post(
    "/:id/complete",
    protect,
    asyncHandler(async (req, res) => {
        const item = await Item.findById(req.params.id);
        if (!item) throw new HttpError(404, "Item not found");
        if (!canModify(req.user, item.donor)) throw new HttpError(403, "Only the donor can complete this");
        if (item.status !== "claimed") throw new HttpError(400, "Item must be claimed first");

        item.status = "donated";
        await item.save();
        res.json({ message: "Marked as donated. Thank you!", item });
    })
);

module.exports = router;
