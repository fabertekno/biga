const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  // Cash balances
  cashTL: { type: Number, default: 0 },
  cashUSD: { type: Number, default: 0 },
  
  // TR USD as structured data
  trUSD: {
    amount: { type: Number, default: 0 },
    history: [{
      date: { type: Date, default: Date.now },
      change: Number,
      previousAmount: Number,
      newAmount: Number
    }]
  },
  
  shippingTotal: { type: Number, default: 0 },
  totalToPay: { type: Number, default: 0 }

}, {
  timestamps: true,
  // Add validation
  validateBeforeSave: true
});

// Enhanced singleton pattern with initialization
balanceSchema.statics.getSingleton = async function() {
  let balance = await this.findOne();
  if (!balance) {
    balance = await this.create({
      cashTL: 0,
      cashUSD: 0,
      trUSD: {
        amount: 0,
        history: []
      },
      shippingTotal: 0,
      totalToPay: 0
    });
  }
  
  // Ensure trUSD structure exists
  if (!balance.trUSD) {
    balance.trUSD = { amount: 0, history: [] };
  }
  if (!balance.trUSD.history) {
    balance.trUSD.history = [];
  }
  
  return balance;
};

// Add instance method for updating TR USD
balanceSchema.methods.updateTrUSD = async function(newAmount) {
  const oldAmount = this.trUSD.amount;
  const change = newAmount - oldAmount;
  
  this.trUSD = {
    amount: newAmount,
    history: [
      {
        date: new Date(),
        change,
        previousAmount: oldAmount,
        newAmount
      },
      ...this.trUSD.history.slice(0, 4) // Keep last 5 entries
    ]
  };
  
  return this.save();
};

module.exports = mongoose.model('Balance', balanceSchema);
