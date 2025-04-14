require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Import DB connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' })); // Allow requests from all origins
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
connectDB().catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Stop the app if database connection fails
});

// Test route
app.get("/", (req, res) => {
    res.send("Job Tracking API is running...");
});

// Import and use routes with error handling
const incomeRoutes = require("./routes/income");
const jobRoutes = require("./routes/jobs");
const customerRoutes = require("./routes/customers");
const authRoutes = require("./routes/auth");
const exchangeRateRoutes = require("./routes/exchangeRate");
const expenseRoutes = require("./routes/expenses");
const invoiceRoutes = require("./routes/invoice");
const balanceRoutes = require("./routes/balances");

app.use("/api/income", incomeRoutes); // Income API
app.use("/api/jobs", jobRoutes); // Jobs API
app.use("/api/customers", customerRoutes); // Customer API
app.use("/api/auth", authRoutes); // Authentication API
app.use("/api/exchange-rate", exchangeRateRoutes); // Exchange rate API
app.use("/api/expenses", expenseRoutes); // Expenses API
app.use("/api/invoices", invoiceRoutes); // Invoice API
app.use("/api/balances", balanceRoutes); // Balances API

// Global Error Handling (Prevents crashes on unhandled rejections)
process.on("unhandledRejection", (err, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", err);
    process.exit(1);
});

// Start server with error handling
try {
    app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});

} catch (error) {
    console.error("Error starting server:", error);
}
