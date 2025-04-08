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

// Import and use the income route
const incomeRoutes = require("./routes/income");
app.use("/api/income", incomeRoutes); // Income API setup

// Import and use the jobs route
const jobRoutes = require("./routes/jobs");
app.use("/api/jobs", jobRoutes); // Jobs API setup

// Import and use the customer route
const customerRoutes = require("./routes/customers");
app.use("/api/customers", customerRoutes); // Customer API setup

// Import and use the authentication route
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes); // Authentication API setup

// Import and use the new exchange rate route
const exchangeRateRoutes = require("./routes/exchangeRate");
app.use("/api/exchange-rate", exchangeRateRoutes);

// Import and use the expenses route
const expenseRoutes = require("./routes/expenses");
app.use("/api/expenses", expenseRoutes); // Expenses API setup

// Global Error Handling (Prevents crashes on unhandled rejections)
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    process.exit(1);
});

// Import and use the invoice route
const invoiceRoutes = require("./routes/invoice");
app.use("/api/invoices", invoiceRoutes); // Invoice API setup


app.use('/api/jobs', require('./routes/jobs'));


// Start server with error handling
try {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error("Error starting server:", error); // Log the error if the server fails to start
}