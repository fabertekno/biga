const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("❌ MONGODB_URI is not defined in environment variables");
        }

        console.log('Mongo URI:', uri); // optional: remove in production
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
