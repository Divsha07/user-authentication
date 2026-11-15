
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
    res.send("User Authentication API is running!");
});

// REGISTER ROUTE
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "Enter a valid email and password of at least 8 characters."
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Save new user
        const newUser = new User({
            email: email.trim().toLowerCase(),
            passwordHash: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully!"
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists."
            });
        }

        res.status(500).json({
            message: "Registration failed."
        });
    }
});

// LOGIN ROUTE
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        res.json({
            message: "Login successful!",
            token: token
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

// PROTECTED PROFILE ROUTE
app.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            message: "Access granted!",
            user: user
        });

    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            message: "Could not retrieve profile."
        });
    }
});

// LOGOUT ROUTE
app.post("/logout", auth, (req, res) => {
    res.json({
        message: "Logout successful. Please remove your JWT token from client storage."
    });
});

// CONNECT TO MONGODB AND START SERVER
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

