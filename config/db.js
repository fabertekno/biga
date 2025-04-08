require('dotenv').config();  // Load the environment variables
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Ensure MONGO_URI is loaded properly
        console.log('Mongo URI:', process.env.MONGO_URI);  // Log to check the value
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
