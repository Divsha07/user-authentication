
const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    passwordHash: {
        type: String,
        required: true
    }

}, { timestamps: true });

// Create User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
