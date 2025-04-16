const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("❌ MONGODB_URI is not defined in environment variables");
        }

        // Remove this line in production if not needed
        if (process.env.NODE_ENV !== "production") {
            console.log("🔌 Connecting to Mongo URI:", uri);
        }

        await mongoose.connect(uri);

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
