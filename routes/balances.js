const express = require("express");
const asyncHandler = require("express-async-handler");
const Balance = require("../models/Balance");
const router = express.Router();

// GET current balance
router.get("/current", async (req, res) => {
  try {
    const balance = await Balance.getSingleton();
    
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: "Balance record not found"
      });
    }

    res.json({
      success: true,
      trUSD: balance.trUSD || 0
    });
    
  } catch (error) {
    console.error("GET balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch balance"
    });
  }
});

// UPDATE balance
router.put("/current", async (req, res) => {
  try {
    const { trUSD } = req.body;
    const amount = parseFloat(trUSD);

    if (isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount provided"
      });
    }

    const balance = await Balance.getSingleton();
    balance.trUSD = amount;
    await balance.save();

    res.json({
      success: true,
      trUSD: balance.trUSD
    });

  } catch (error) {
    console.error("UPDATE balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update balance"
    });
  }
});

// Shipping Total Endpoint
router.put("/shipping-total", asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const balance = await Balance.getSingleton();
  
  balance.shippingTotal = amount;
  await balance.save();
  res.json({ shippingTotal: balance.shippingTotal });
}));

module.exports = router;
