require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Import DB connection

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'https://bigasoft.org', // Allow only this domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true // Allow sending cookies/auth headers
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly handle preflight requests

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

// Routes
const incomeRoutes = require("./routes/income");
const jobRoutes = require("./routes/jobs");
const customerRoutes = require("./routes/customers");
const authRoutes = require("./routes/auth");
const exchangeRateRoutes = require("./routes/exchangeRate");
const expenseRoutes = require("./routes/expenses");
const invoiceRoutes = require("./routes/invoice");
const balanceRoutes = require("./routes/balances");

app.use("/api/income", incomeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exchange-rate", exchangeRateRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/balances", balanceRoutes);

// Global Error Handling
process.on("unhandledRejection", (err, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", err);
    process.exit(1);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
