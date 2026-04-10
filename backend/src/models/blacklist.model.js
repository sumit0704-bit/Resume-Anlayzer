const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically deletes the record after 24 hours (matching your JWT expiry)
    }
});

module.exports = mongoose.model("blacklist", blacklistSchema);