const express = require("express");
const asyncHandler = require("express-async-handler");
const Balance = require("../models/Balance");
const router = express.Router();

// Get all balances (including TR USD and Shipping)
router.get("/", asyncHandler(async (req, res) => {
  const balance = await Balance.getSingleton();
  res.json(balance);
}));

// TR USD Endpoints
router.put("/tr-usd", asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body; // Only the amount, no history included
    const balance = await Balance.getSingleton();
    
    if (!balance) {
      return res.status(404).json({ message: "Balance not found" });
    }

    // Update TR USD balance as a simple number, similar to cashTL and cashUSD
    balance.trUSD = amount; // Just store the amount as a number

    await balance.save();
    res.json({ trUSD: balance.trUSD }); // Return the updated TR USD balance
  } catch (error) {
    console.error("Error updating TR USD balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}));

// Shipping Total Endpoint
router.put("/shipping-total", asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const balance = await Balance.getSingleton();
  
  balance.shippingTotal = amount;
  await balance.save();
  res.json({ shippingTotal: balance.shippingTotal });
}));

module.exports = router;
