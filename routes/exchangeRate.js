const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// ✅ Exchange Rate Model
const ExchangeRate = mongoose.model("ExchangeRate", new mongoose.Schema({
    rate: { type: Number, required: true }
}));

// ✅ GET: Fetch current exchange rate
router.get("/", async (req, res) => {
    try {
        let rate = await ExchangeRate.findOne();
        if (!rate) {
            rate = new ExchangeRate({ rate: 28.5 }); // Default rate
            await rate.save();
        }
        res.json({ rate: rate.rate });
    } catch (err) {
        console.error("❌ Error fetching exchange rate:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// ✅ POST: Update exchange rate
router.post("/", async (req, res) => {
    const { rate } = req.body;
    if (!rate || isNaN(rate)) {
        return res.status(400).json({ error: "Invalid rate value" });
    }

    try {
        let exchangeRate = await ExchangeRate.findOne();
        if (!exchangeRate) {
            exchangeRate = new ExchangeRate({ rate: 28.5 });
        }
        exchangeRate.rate = parseFloat(rate);
        await exchangeRate.save();
        res.json({ success: true, newRate: exchangeRate.rate });
    } catch (err) {
        console.error("❌ Error updating exchange rate:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
