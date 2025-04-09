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
  const { amount, change } = req.body;
  const balance = await Balance.getSingleton();
  
  // Update TR USD balance and history
  balance.trUSD = {
    amount,
    history: [
      ...(balance.trUSD?.history || []).slice(0, 4), // Keep last 5 entries
      {
        date: new Date(),
        change,
        previousAmount: balance.trUSD?.amount || 0,
        newAmount: amount
      }
    ]
  };
  
  await balance.save();
  res.json(balance.trUSD);
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
