require('dotenv').config();  // Load the environment variables
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Ensure MONGO_URI is loaded properly
        console.log('Mongo URI:', process.env.MONGODB_URI);
await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
