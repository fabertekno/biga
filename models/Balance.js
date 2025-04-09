const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  cashTL: { type: Number, default: 0 },
  cashUSD: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Ensure there's only one balance document
balanceSchema.statics.getSingleton = async function() {
  let balance = await this.findOne();
  if (!balance) {
    balance = await this.create({});
  }
  return balance;
};

module.exports = mongoose.model('Balance', balanceSchema);
