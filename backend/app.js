const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const campaignRoutes = require("./routes/campaigns");
const donationRoutes = require("./routes/donations");
const postRoutes = require("./routes/posts");
const itemRoutes = require("./routes/items");
const statsRoutes = require("./routes/stats");
const adminRoutes = require("./routes/admin");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

// Render and most hosts sit behind a proxy; needed for correct client IPs in rate limiting
app.set("trust proxy", 1);

// CLIENT_URL can be a comma separated list, e.g. "http://localhost:5173,https://unitree.vercel.app"
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(helmet());
app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
    })
);
// Images are sent as compressed base64 data URLs, so allow a generous body size
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
    res.json({ name: "Unitree API", status: "ok" });
});
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
// Legacy paths (/api/register, /api/login) kept for older clients
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
// Legacy path (/api/delete/:id) kept for older clients
app.delete("/api/delete/:id", (req, res, next) => {
    req.url = `/${req.params.id}`;
    userRoutes(req, res, next);
});
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
