const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Shipped", "Packaging", "Completed"], 
    default: "Pending" 
  },
  assignedTo: { type: String, required: false },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: { type: String, required: true },
  piece: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  cost: { type: Number, required: true },
  // ONLY NEW FIELD ADDED:
  shippingCostUSD: { 
    type: Number,
    default: 0 // Default to 0 so existing jobs won't break
  }
}, {
  timestamps: true // Keeps your existing auto-timestamps
});

// Your existing pre-save hook remains unchanged
jobSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Model check remains exactly the same
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

module.exports = Job;