const express = require("express");
const asyncHandler = require("express-async-handler");
const Balance = require("../models/Balance");
const router = express.Router();

// In your balance routes file
router.get("/current", asyncHandler(async (req, res) => {
  try {
    const balance = await Balance.getSingleton();
    
    // Ensure we always return a number
    const trUSD = typeof balance.trUSD === 'number' ? balance.trUSD : 0;
    
    res.json({
      success: true,
      trUSD: trUSD,
      // Include other balance fields if needed
    });
  } catch (error) {
    console.error("Error fetching balances:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
}));

router.put("/current", asyncHandler(async (req, res) => {
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
    console.error("Error updating balance:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
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
