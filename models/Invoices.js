const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            total: { type: Number, required: true },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
