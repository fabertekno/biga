const express = require("express");
const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");  // Make sure this is the correct path to your Expense model
const Job = require("../models/Job");  // Make sure this is the correct path to your Job model

const router = express.Router();

// 🔹 Get income payments for a specific customer (GET)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { customerId } = req.query; // Get customerId from query parameters
    if (!customerId) {
      return res.status(400).json({ message: "Missing customer ID" });
    }

    try {
      // Step 1: Find all job IDs related to this customer
      const jobs = await Job.find({ customer: customerId }).select("_id title"); // Include job title
      const jobIds = jobs.map((job) => job._id);

      // Step 2: Find all income payments for these jobs and populate job details
      const payments = await Expense.find({ job: { $in: jobIds }, kind: "Income" })
        .populate("job", "title"); // Populate the job title

      // Step 3: Format the response to include jobTitle
      const formattedPayments = payments.map(payment => ({
        _id: payment._id,
        date: payment.date,
        amount: payment.amount,
        jobId: payment.job._id,
        jobTitle: payment.job.title, // Include job title in the response
      }));

      res.json(formattedPayments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching income payments", error });
    }
  })
);

module.exports = router;