require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Import DB connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' })); // Allow requests from all origins (you can restrict to specific origins later)
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
    res.send("Job Tracking API is running...");
});

// Import and use routes
const incomeRoutes = require("./routes/income");
const jobRoutes = require("./routes/jobs");
const customerRoutes = require("./routes/customers");
const authRoutes = require("./routes/auth");
const exchangeRateRoutes = require("./routes/exchangeRate");
const expenseRoutes = require("./routes/expenses");
const invoiceRoutes = require("./routes/invoice");

app.use("/api/income", incomeRoutes); // Income API
app.use("/api/jobs", jobRoutes); // Jobs API
app.use("/api/customers", customerRoutes); // Customer API
app.use("/api/auth", authRoutes); // Authentication API
app.use("/api/exchange-rate", exchangeRateRoutes); // Exchange rate API
app.use("/api/expenses", expenseRoutes); // Expenses API
app.use("/api/invoices", invoiceRoutes); // Invoice API

// Global Error Handling (Prevents crashes on unhandled rejections)
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    process.exit(1);
});

// Start server with error handling
try {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error("Error starting server:", error); // Log the error if the server fails to start
}
