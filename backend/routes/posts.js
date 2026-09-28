const express = require("express");
const Post = require("../models/Post");
const Campaign = require("../models/Campaign");
const { protect, canModify } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../middleware/error");
const { getPagination, searchFilter, pick, AUTHOR_FIELDS } = require("../utils/query");

const router = express.Router();

const EDITABLE = ["title", "content", "coverImage", "tags", "campaign"];

const cleanTags = (tags) => {
    const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
    return [...new Set(list.map((t) => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 8);
};

// A post may only be linked to a campaign its author owns
const checkCampaign = async (campaignId, user) => {
    if (!campaignId) return undefined;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new HttpError(400, "Linked campaign not found");
    if (!canModify(user, campaign.creator)) {
        throw new HttpError(403, "You can only post updates to your own campaigns");
    }
    return campaign._id;
};

const loadPost = (id) =>
    Post.findById(id)
        .populate("author", AUTHOR_FIELDS)
        .populate("campaign", "title image")
        .populate("comments.author", "username avatar");

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const { search, tag, author, campaign } = req.query;
        const { page, limit, skip } = getPagination(req.query, 9);

        const filter = { ...searchFilter(search, ["title", "content"]) };
        if (tag) filter.tags = String(tag).toLowerCase();
        if (author) filter.author = author;
        if (campaign) filter.campaign = campaign;

        const [posts, total] = await Promise.all([
            Post.find(filter)
                .populate("author", "username avatar")
                .populate("campaign", "title")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Post.countDocuments(filter),
        ]);

        // Send counts instead of full comment threads in the list view
        const list = posts.map((p) => {
            const obj = p.toObject();
            obj.commentCount = obj.comments.length;
            obj.likeCount = obj.likes.length;
            obj.excerpt = obj.content.slice(0, 220);
            delete obj.comments;
            delete obj.content;
            return obj;
        });

        res.json({ posts: list, total, page, pages: Math.ceil(total / limit) || 1 });
    })
);

router.get(
    "/:id",
    asyncHandler(async (req, res) => {
        await Post.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });
        const post = await loadPost(req.params.id);
        if (!post) throw new HttpError(404, "Post not found");
        res.json(post);
    })
);

router.post(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const data = pick(req.body, EDITABLE);
        data.tags = cleanTags(data.tags);
        data.campaign = await checkCampaign(data.campaign, req.user);

        const post = await Post.create({ ...data, author: req.user._id });
        res.status(201).json(post);
    })
);

router.put(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const post = await Post.findById(req.params.id);
        if (!post) throw new HttpError(404, "Post not found");
        if (!canModify(req.user, post.author)) throw new HttpError(403, "You can only edit your own posts");

        const data = pick(req.body, EDITABLE);
        if (data.tags !== undefined) data.tags = cleanTags(data.tags);
        if (data.campaign !== undefined) data.campaign = await checkCampaign(data.campaign, req.user);

        Object.assign(post, data);
        await post.save();
        res.json(post);
    })
);

router.delete(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const post = await Post.findById(req.params.id);
        if (!post) throw new HttpError(404, "Post not found");
        if (!canModify(req.user, post.author)) throw new HttpError(403, "You can only delete your own posts");

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    })
);

// Toggles the current user's like
router.post(
    "/:id/like",
    protect,
    asyncHandler(async (req, res) => {
        const post = await Post.findById(req.params.id);
        if (!post) throw new HttpError(404, "Post not found");

        const liked = post.likes.some((id) => id.equals(req.user._id));
        await Post.updateOne(
            { _id: post._id },
            liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
        );
        const likes = liked ? post.likes.length - 1 : post.likes.length + 1;
        res.json({ liked: !liked, likes });
    })
);

router.post(
    "/:id/comments",
    protect,
    asyncHandler(async (req, res) => {
        const text = String(req.body.text || "").trim();
        if (!text) throw new HttpError(400, "Comment cannot be empty");

        const post = await Post.findById(req.params.id);
        if (!post) throw new HttpError(404, "Post not found");

        post.comments.push({ author: req.user._id, text });
        await post.save();

        const updated = await loadPost(post._id);
        res.status(201).json(updated.comments);
    })
);

router.delete(
    "/:id/comments/:commentId",
    protect,
    asyncHandler(async (req, res) => {
        const post = await Post.findById(req.params.id);
        if (!post) throw new HttpError(404, "Post not found");

        const comment = post.comments.id(req.params.commentId);
        if (!comment) throw new HttpError(404, "Comment not found");
        // Comment author, post author, or admin may delete
        if (!canModify(req.user, comment.author) && !canModify(req.user, post.author)) {
            throw new HttpError(403, "You cannot delete this comment");
        }

        comment.deleteOne();
        await post.save();

        const updated = await loadPost(post._id);
        res.json(updated.comments);
    })
);

module.exports = router;
