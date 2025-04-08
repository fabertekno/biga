const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Removed tls/ssl options to let MongoDB Atlas handle it automatically
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
