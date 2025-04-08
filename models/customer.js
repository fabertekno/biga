const mongoose = require("mongoose");

// Clear the model cache to avoid OverwriteModelError
delete mongoose.connection.models["Customer"];

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    lowercase: true, // Convert email to lowercase
    trim: true, // Trim whitespace
  },
  address: {
    type: String,
    required: true,
  },
    // NEW BALANCE FIELD (Add this)
  balance: {
    type: Number,
    default: 0,  // Default to 0 if not specified
    required: true // Not required since we'll calculate it
  }
    
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Adding a virtual field 'customerId' to return the string version of the _id
customerSchema.virtual('customerId').get(function () {
  return this._id.toString();
});

// This ensures that the virtual field shows up when you call .toJSON() or .toObject()
customerSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model("Customer", customerSchema);
