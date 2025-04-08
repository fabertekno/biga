const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Job = require("../models/Job"); 
const { authMiddleware } = require('../middleware/auth');  // Add this line


// Add this near the top with other routes (BEFORE the /:id routes)
router.get('/with-balance', authMiddleware, async (req, res) => {
  try {
    console.log('User making request:', req.user); // Debug who's accessing
    
    // Disable caching for this endpoint
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    
    const customers = await Customer.find({
      balance: { $ne: 0 }
    })
    .select('customerName balance _id')
    .sort({ balance: -1 })
    .lean();

    console.log(`Found ${customers.length} customers with balances`);
    
    // Add freshness indicator
    const response = {
      data: customers,
      timestamp: Date.now(),
      generatedBy: req.user._id
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ 
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? error.message : null,
      requestId: req.id
    });
  }
});


// ✅ POST a new customer (keep this before "/:id" route)
router.post("/", async (req, res) => {
  const { customerName, phone, email, address } = req.body;

  if (!customerName || !phone || !email || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newCustomer = new Customer({
    customerName,
    phone,
    email,
    address,
    balance: 0 
  });

  try {
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving customer", error: err.message });
  }
});
// GET all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});



// GET a customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching customer", error: err.message });
  }
});

// PUT (update) a customer by ID
router.put("/:id", async (req, res) => {
  const { customerName, phone, email, address } = req.body;

  if (!customerName || !phone || !email || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { customerName, phone, email, address },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(updatedCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating customer", error: err.message });
  }
});

// DELETE a customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting customer", error: err.message });
  }
});


// GET all jobs for a specific customer
router.get("/:id/jobs", async (req, res) => {
  try {
    const customerId = req.params.id;
    const jobs = await Job.find({ customer: customerId });

    if (!jobs.length) {
      return res.status(404).json({ message: "No jobs found for this customer" });
    }

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching customer jobs:", err);
    res.status(500).json({ message: "Error fetching jobs", error: err.message });
  }
});



router.patch('/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: { balance } },
      { new: true }
    );
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
