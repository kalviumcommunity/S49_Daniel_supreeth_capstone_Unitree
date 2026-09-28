const mongoose = require("mongoose");

const ITEM_CATEGORIES = ["Clothing", "Books", "Electronics", "Furniture", "Toys", "Kitchen", "Medical", "Other"];

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            maxlength: [100, "Name must be at most 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [2000, "Description is too long"],
        },
        category: { type: String, enum: ITEM_CATEGORIES, default: "Other" },
        condition: { type: String, enum: ["New", "Like new", "Good", "Fair"], default: "Good" },
        quantity: { type: Number, min: [1, "Quantity must be at least 1"], default: 1 },
        location: { type: String, maxlength: 100, default: "" },
        images: {
            type: [String],
            validate: [(arr) => arr.length <= 5, "You can upload at most 5 photos"],
        },
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["available", "claimed", "donated"], default: "available" },
        claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        claimMessage: { type: String, maxlength: 500, default: "" },
        claimedAt: { type: Date },
    },
    { timestamps: true }
);

itemSchema.statics.CATEGORIES = ITEM_CATEGORIES;

module.exports = mongoose.model("Item", itemSchema);
