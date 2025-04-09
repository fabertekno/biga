const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  // Existing cash balances
  cashTL: { type: Number, default: 0 },
  cashUSD: { type: Number, default: 0 },
  
  // New fields for TR USD and Shipping
  trUSD: {
    amount: { type: Number, default: 0 },
    history: [{
      date: { type: Date, default: Date.now },
      change: Number,
      previousAmount: Number,
      newAmount: Number
    }]
  },
  shippingTotal: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Singleton pattern (keep this)
balanceSchema.statics.getSingleton = async function() {
  let balance = await this.findOne();
  if (!balance) {
    balance = await this.create({});
  }
  return balance;
};

module.exports = mongoose.model('Balance', balanceSchema);
