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
    const { amount, change } = req.body;
    const balance = await Balance.getSingleton();
    
    if (!balance) {
      return res.status(404).json({ message: "Balance not found" });
    }

    // Ensure TR USD exists in the balance object
    if (!balance.trUSD) {
      balance.trUSD = { amount: 0, history: [] };
    }

    // Update TR USD balance and history
    balance.trUSD = {
      amount,
      history: [
        ...(balance.trUSD.history || []).slice(0, 4), // Keep last 5 entries
        {
          date: new Date(),
          change,
          previousAmount: balance.trUSD.amount || 0,
          newAmount: amount
        }
      ]
    };

    await balance.save();
    res.json(balance.trUSD);
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
