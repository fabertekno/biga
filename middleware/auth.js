const jwt = require("jsonwebtoken");

// Authentication middleware - checks if user is authenticated
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from Authorization header

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded; // Attach decoded user info to request
        next(); // Proceed
    } catch (error) {
        console.error("Token verification error:", error); // Log the error
        return res.status(401).json({ message: "Token is not valid" });
    }
};

// Admin middleware - checks if the user is an admin
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied, admin only" });
    }
    next(); // Proceed if the user is an admin
};

module.exports = { authMiddleware, adminMiddleware };
