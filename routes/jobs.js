const express = require("express");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Job = require("../models/job");
const { authMiddleware } = require('../middleware/auth'); // Destructure to get authMiddleware from the object


const router = express.Router();

// 📌 Middleware for validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 🔹 Create a new job (POST)
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("customer").notEmpty().withMessage("Customer ID is required"),
    body("customerName").notEmpty().withMessage("Customer name is required"), // Validate customerName
    body("piece").isInt({ min: 1 }).withMessage("Piece must be a positive number"),
    body("salePrice").isFloat({ min: 0 }).withMessage("Sale price must be a valid number"),
    body("cost").isFloat({ min: 0 }).withMessage("Cost must be a valid number"),
    body("status")
      .optional()
      .isIn(["Pending", "In Progress", "Packaging", "Completed", "Shipped"])
      .withMessage("Status must be one of: Pending, In Progress, Packaging, Completed, or Shipped"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    console.log("Received request body:", req.body); // Debugging

    const { title, description, status = "Pending", assignedTo, customer, customerName, piece, salePrice, cost } = req.body;

    const newJob = new Job({
      title,
      description,
      status,
      assignedTo,
      customer,
      customerName, // Include customerName
      piece,
      salePrice,
      cost,
    });

    console.log("Received customerName:", customerName); // Debugging
    console.log("New job to be saved:", newJob); // Debugging

    const savedJob = await newJob.save();
    console.log("Job saved successfully:", savedJob); // Debugging

    res.status(201).json(savedJob);
  })
);

// 🔹 Get all jobs or jobs for a specific customer (GET)
router.get(
  "/income",
  asyncHandler(async (req, res) => {
    const { customerId } = req.query; // Get customerId from query parameters
    if (!customerId) {
      return res.status(400).json({ message: "Missing customer ID" });
    }

    try {
      // Step 1: Find all job IDs related to this customer
      const jobs = await Job.find({ customer: customerId }).select("_id");
      const jobIds = jobs.map((job) => job._id);

      // Step 2: Find all income payments for these jobs
      const payments = await Expense.find({ job: { $in: jobIds }, kind: "Income" });

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching income payments", error });
    }
  })
);


// 🔹 Get all jobs or jobs for a specific customer (GET)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { customerId } = req.query; // Get customerId from query parameters

    // If customerId is provided, filter jobs by customerId
    const filter = customerId ? { customer: customerId } : {};

    try {
      const jobs = await Job.find(filter); // Fetch jobs
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching jobs", error });
    }
  })
);

// 🔹 Update a job (PUT)
router.put(
  "/:id",
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("customerName").optional().notEmpty().withMessage("Customer name cannot be empty"), // Validate customerName
    body("piece").optional().isInt({ min: 1 }).withMessage("Piece must be a positive number"),
    body("salePrice").optional().isFloat({ min: 0 }).withMessage("Sale price must be a valid number"),
    body("cost").optional().isFloat({ min: 0 }).withMessage("Cost must be a valid number"),
    body("status")
      .optional()
      .isIn(["Pending", "In Progress", "Packaging", "Completed", "Shipped"])
      .withMessage("Status must be one of: Pending, In Progress, Packaging, Completed, or Shipped"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { title, description, customerName, piece, salePrice, cost, status } = req.body;

    // Find and update the job
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        customerName, // Include customerName in the update
        piece,
        salePrice,
        cost,
        status,
        updatedAt: Date.now(), // Update the timestamp
      },
      { new: true, runValidators: true } // Return the updated job and run validators
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  })
);

// 🔹 Delete a job (DELETE)
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const job = await Job.findByIdAndDelete(req.params.id); // Delete job by ID
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  })
);



// 🔹 Get a single job by ID (GET)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    console.log("Fetching job with ID:", req.params.id); // Debugging

    const job = await Job.findById(req.params.id);
    if (!job) {
      console.log("Job not found for ID:", req.params.id); // Debugging
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("Fetched job data:", job); // Debugging
    res.json(job);
  })
);


// Express route for getting jobs
router.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({}); // Mongoose example
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Update shipping cost for a job
router.put('/:id/shipping', authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Update shipping cost
        job.shippingCostUSD = req.body.shippingCostUSD;
        await job.save();

        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;