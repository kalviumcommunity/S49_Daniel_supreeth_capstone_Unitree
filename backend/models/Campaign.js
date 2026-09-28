const mongoose = require("mongoose");

const CATEGORIES = ["Community", "Medical", "Education", "Animals", "Environment", "Emergency", "Creative", "Other"];

const campaignSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [120, "Title must be at most 120 characters"],
        },
        summary: {
            type: String,
            required: [true, "A short summary is required"],
            trim: true,
            maxlength: [200, "Summary must be at most 200 characters"],
        },
        story: {
            type: String,
            required: [true, "Tell people your story"],
            maxlength: [10000, "Story is too long"],
        },
        category: { type: String, enum: CATEGORIES, default: "Other" },
        goal: {
            type: Number,
            required: [true, "Goal amount is required"],
            min: [1, "Goal must be at least 1"],
        },
        raised: { type: Number, default: 0 },
        donationCount: { type: Number, default: 0 },
        image: { type: String, default: "" },
        location: { type: String, maxlength: 100, default: "" },
        deadline: { type: Date },
        status: { type: String, enum: ["active", "completed", "closed"], default: "active" },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

campaignSchema.index({ title: "text", summary: "text", story: "text" });

campaignSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model("Campaign", campaignSchema);
