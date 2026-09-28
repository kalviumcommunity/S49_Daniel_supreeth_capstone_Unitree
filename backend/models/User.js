const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            minlength: [2, "Username must be at least 2 characters"],
            maxlength: [40, "Username must be at most 40 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        bio: { type: String, maxlength: 500, default: "" },
        location: { type: String, maxlength: 100, default: "" },
        phone: { type: String, maxlength: 20, default: "" },
        avatar: { type: String, default: "" },
        isBlocked: { type: Boolean, default: false },
        lastLogin: { type: Date },
        loginCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        // Same collection the original UserRegister model used, so existing accounts keep working
        collection: "userregisters",
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
