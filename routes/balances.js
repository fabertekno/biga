const express = require("express");
const asyncHandler = require("express-async-handler");
const Balance = require("../models/Balance");
const router = express.Router();

// GET current balance
router.get("/current", async (req, res) => {
  try {
    const balance = await Balance.getSingleton();
    
    res.json({
      success: true,
      balances: {
        cashTL: balance.cashTL,
        cashUSD: balance.cashUSD,
        trUSD: balance.trUSD.amount, // Return just the amount
        shippingTotal: balance.shippingTotal
      },
      // Optional: include recent history
      recentHistory: balance.trUSD.history.slice(0, 5)
    });
    
  } catch (error) {
    console.error("GET balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch balance"
    });
  }
});

// UPDATE TR USD balance
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
    await balance.updateTrUSD(amount);

    res.json({
      success: true,
      trUSD: balance.trUSD.amount,
      newEntry: balance.trUSD.history[0] // Return the new history entry
    });

  } catch (error) {
    console.error("UPDATE balance error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update balance"
    });
  }
});
// Add this GET endpoint
router.get("/shipping-total", asyncHandler(async (req, res) => {
  try {
    const balance = await Balance.getSingleton();
    res.json({ 
      success: true,
      shippingTotal: balance.shippingTotal || 0
    });
  } catch (error) {
    console.error("Error fetching shipping total:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipping total"
    });
  }
}));

// Update the PUT endpoint
router.put("/shipping-total", asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;
    const balance = await Balance.getSingleton();
    
    balance.shippingTotal = amount;
    await balance.save();
    
    res.json({ 
      success: true,
      shippingTotal: balance.shippingTotal
    });
  } catch (error) {
    console.error("Error updating shipping total:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipping total"
    });
  }
}));

router.get("/total-to-pay", asyncHandler(async (req, res) => {
  try {
    const balance = await Balance.getSingleton();
    res.json({
      success: true,
      totalToPay: balance.totalToPay || 0
    });
  } catch (error) {
    console.error("Error fetching totalToPay:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch totalToPay"
    });
  }
}));


router.put("/total-to-pay", asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;
    const balance = await Balance.getSingleton();

    balance.totalToPay = amount;
    await balance.save();

    res.json({
      success: true,
      totalToPay: balance.totalToPay
    });
  } catch (error) {
    console.error("Error updating totalToPay:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update totalToPay"
    });
  }
}));


module.exports = router;
