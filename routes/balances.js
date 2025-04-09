const express = require("express");
const asyncHandler = require("express-async-handler");
const Balance = require("../models/Balance");
const router = express.Router();

// TR USD Balance Routes
router.get("/tr-usd", asyncHandler(async (req, res) => {
  const balance = await Balance.findOne({ type: 'tr-usd' });
  res.json(balance || { amount: 0, history: [] });
}));

router.put("/tr-usd", asyncHandler(async (req, res) => {
  const { amount, change } = req.body;
  
  let balance = await Balance.findOne({ type: 'tr-usd' });
  if (!balance) {
    balance = new Balance({ 
      type: 'tr-usd',
      amount,
      history: []
    });
  } else {
    balance.amount = amount;
  }
  
  if (change) {
    balance.history.unshift({
      date: new Date(),
      change,
      previousAmount: balance.amount - change,
      newAmount: amount
    });
    balance.history = balance.history.slice(0, 5);
  }
  
  await balance.save();
  res.json(balance);
}));

// Shipping Costs Total (if you want to track aggregate)
router.get("/shipping-total", asyncHandler(async (req, res) => {
  const balance = await Balance.findOne({ type: 'shipping-total' });
  res.json(balance || { amount: 0 });
}));

module.exports = router;
