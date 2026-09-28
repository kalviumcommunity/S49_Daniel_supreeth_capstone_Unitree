const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [1, "Minimum donation is 1"],
            max: [1000000, "Maximum donation is 1,000,000"],
        },
        message: { type: String, maxlength: 300, default: "" },
        anonymous: { type: Boolean, default: false },
        paymentMethod: { type: String, enum: ["card", "upi", "netbanking"], default: "card" },
        // Payments are simulated; this is a generated receipt reference
        reference: { type: String, required: true },
        status: { type: String, enum: ["completed", "refunded"], default: "completed" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
