const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  kind: { type: String, required: true }, // Expense or Income
  description: { type: String, required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Reference to Job
});

module.exports = mongoose.model("Expense", expenseSchema);
