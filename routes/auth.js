const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Job = require("../models/job");  // Add this at the top
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const bcrypt = require("bcrypt");


// Delete user (Only Admins can delete)
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

// Register new user
router.post("/register", async (req, res) => {
    const { phone, password, role, customerId } = req.body;

    // Check if required fields are provided
    if (!phone || !password || !role) {
        return res.status(400).json({ message: "Please provide all required fields: phone, password, and role" });
    }

    // If the role is 'customer', ensure customerId is provided
    if (role === 'customer' && !customerId) {
        return res.status(400).json({ message: "Customer ID is required for customers" });
    }

    try {
        // Check if user with the phone already exists
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const user = new User({
            phone,
            password,
            role,
            customerId: role === 'customer' ? customerId : null, // Only set customerId if role is 'customer'
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // Log detailed error for debugging
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Function to fetch jobs related to a specific customer
async function getCustomerJobs(customerId, page = 1, limit = 5) {
    try {
        const jobs = await Job.find({ customerId: customerId })
            .skip((page - 1) * limit)  // Skip jobs based on page number
            .limit(limit);  // Limit the number of jobs returned
        return jobs;
    } catch (error) {
        console.error("Error fetching jobs for customer:", error);
        return [];
    }
}


// Login user
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: "Please provide phone and password" });
    }

    try {
        const user = await User.findOne({ phone }).populate('customerId');
        console.log('User:', user); // ✅ Add this line

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('Customer ID:', user.customerId); // ✅ And this one

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                customerId: user.role === 'customer' && user.customerId ? user.customerId._id : null,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const jobs = user.role === 'customer' && user.customerId ? await getCustomerJobs(user.customerId._id) : [];

        res.json({
            token,
            customerName: user.role === 'customer' && user.customerId ? user.customerId.customerName : null,
            customerId: user.role === 'customer' && user.customerId ? user.customerId._id : null,
            jobs
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});



// Protected route to get user profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('customerId');  // Populate customerId to get customer details
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch jobs for customer (only if the role is 'customer')
        const jobs = user.role === 'customer' ? await getCustomerJobs(user.customerId._id) : [];

        // Prepare the profile response
        const profileData = {
            userId: user._id,
            phone: user.phone,
            role: user.role,
            customerName: user.role === 'customer' ? user.customerId.customerName : null,  // Only include customerName if the role is 'customer'
            jobs  // Include jobs if the role is 'customer'
        };

        res.json(profileData);  // Send the user profile data back to the client
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('customerId'); // Populate customer details if available

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
});

// Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().populate('customerId'); // Fetch all users and populate customer details
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});


// Reset user password
router.post("/reset-password/:userId", authMiddleware, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
    }

    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash the password

        // Update the user's password
        user.password = hashedPassword;

        // Save the user with the new password
        await user.save();

        console.log('🔑 New hashed password:', user.password); // Log the new hash
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("❌ Error resetting password:", error);
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
});


module.exports = router;
