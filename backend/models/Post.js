const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: {
            type: String,
            required: [true, "Comment cannot be empty"],
            trim: true,
            maxlength: [1000, "Comment is too long"],
        },
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [150, "Title must be at most 150 characters"],
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            maxlength: [20000, "Post is too long"],
        },
        coverImage: { type: String, default: "" },
        tags: [{ type: String, trim: true, maxlength: 30 }],
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        // Optional: a post can be an update for one of the author's campaigns
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        comments: [commentSchema],
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

postSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", postSchema);
