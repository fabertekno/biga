const express = require("express");
const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const Job = require("../models/job");
const Customer = require("../models/customer");
const fetch = require("node-fetch");  // Ensure you're importing node-fetch correctly
const router = express.Router();


// Cache the exchange rate to avoid repeated API calls
let cachedExchangeRate = null;
let lastExchangeRateFetchTime = 0;
const EXCHANGE_RATE_CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

// Helper function to fetch the exchange rate
async function fetchExchangeRate() {
    try {
        const res = await fetch("http://localhost:5000/api/exchange-rate");
        const data = await res.json();
        return data.rate;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return null;
    }
}

// 🔹 Updated route to fetch job costs for multiple jobs
router.get(
    "/job-cost/:jobIds", // Accept multiple job IDs as a comma-separated string
    asyncHandler(async (req, res) => {
        const jobIds = req.params.jobIds.split(","); // Split the comma-separated string into an array

        try {
            console.log("Fetching job costs for jobIds:", jobIds);

            // Fetch the exchange rate (use cached value if available and not expired)
            const currentTime = Date.now();
            if (!cachedExchangeRate || (currentTime - lastExchangeRateFetchTime > EXCHANGE_RATE_CACHE_DURATION)) {
                cachedExchangeRate = await fetchExchangeRate();
                lastExchangeRateFetchTime = currentTime;
            }

            if (!cachedExchangeRate) {
                return res.status(400).json({ error: "Exchange rate not found" });
            }

            console.log("Using cached exchange rate:", cachedExchangeRate);

            // Fetch all expenses related to the jobs in a single query
            const expenses = await Expense.find({
                job: { $in: jobIds }, // Fetch expenses for all jobIds at once
                kind: "Expense", // Ensure this matches your schema
            });

            console.log("Fetched expenses:", expenses);

            // Calculate the total cost for each job
            const jobCosts = {};
            expenses.forEach((expense) => {
                const jobId = expense.job.toString();
                if (!jobCosts[jobId]) {
                    jobCosts[jobId] = 0;
                }
                if (expense.currency === "TL") {
                    jobCosts[jobId] += expense.amount / cachedExchangeRate; // Convert TL to USD
                } else if (expense.currency === "USD") {
                    jobCosts[jobId] += expense.amount; // Add USD directly
                }
            });

            console.log("Job costs:", jobCosts);

            // Respond with the total costs for the jobs
            res.json(jobCosts);
        } catch (error) {
            console.error("Error calculating job costs:", error);
            res.status(500).json({ error: "Error calculating job costs" });
        }
    })
);



// 🔹 Fetch all expenses with pagination
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;

    // Fetch expenses sorted by date (newest first)
    const expenses = await Expense.find()
      .sort({ date: -1 }) // Sort by date in descending order
      .skip(startIndex)
      .limit(limit)
      .populate("job");

    // Now fetch customer name for each job
    const formattedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        const expenseObject = expense.toObject();

        if (expenseObject.job) {
          // Fetch the customer name using the customerId from the Job model
          const customer = await Customer.findById(expenseObject.job.customer);
          expenseObject.customerName = customer
            ? customer.customerName
            : "Unknown Customer";
        } else {
          expenseObject.customerName = "General"; // For jobs with no customer
        }

        return expenseObject;
      })
    );

    const totalExpenses = await Expense.countDocuments();
    const totalPages = Math.ceil(totalExpenses / limit);

    res.json({
      expenses: formattedExpenses,
      totalPages,
    });
  })
);

// 🔹 Fetch jobs for a specific customer
router.get(
  "/jobs",
  asyncHandler(async (req, res) => {
    const customerId = req.query.customerId;

    if (!customerId) {
      res.status(400).json({ message: "Customer ID is required" });
      return;
    }

    try {
      // Fetch jobs for the customer
      const jobs = await Job.find({ customer: customerId });

      if (!jobs || jobs.length === 0) {
        res.status(404).json({ message: "No jobs found for this customer" });
        return;
      }

      res.status(200).json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Server error" });
    }
  })
);

// 🔹 Add a new expense
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { amount, currency, kind, description, job } = req.body;

    const newExpense = new Expense({
      amount,
      currency,
      kind,
      description,
      job: job === "general" ? null : job, // Set job to null if "General"
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  })
);

// 🔹 Update an existing expense
// 🔹 Fetch a single expense by ID
router.get("/:id", asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate("job");
  console.log("Fetched expense with populated job:", expense);  // Debugging
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json(expense);
}));



router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { amount, currency, kind, description, job } = req.body;

    // Step 1: Fetch the existing expense before updating
    const existingExpense = await Expense.findById(req.params.id);
    if (!existingExpense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    // Step 2: Update the expense
    existingExpense.amount = amount;
    existingExpense.currency = currency;
    existingExpense.kind = kind;
    existingExpense.description = description;
    existingExpense.job = job === "general" ? null : job;
    await existingExpense.save();

    // Step 3: Respond with success
    res.json({
      message: "Expense updated successfully",
      updatedExpense: existingExpense,
    });
  })
);



// 🔹 Delete an expense
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    res.json({ message: "Expense deleted successfully" });
  })
);

module.exports = router;