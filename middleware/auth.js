
const jwt = require("jsonwebtoken");

// Authentication Middleware
const auth = (req, res, next) => {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store user ID in request
        req.userId = decoded.userId;

        // Continue to the protected route
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
};

module.exports = auth;
