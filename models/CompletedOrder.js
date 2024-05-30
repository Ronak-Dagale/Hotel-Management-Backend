const mongoose = require('mongoose')

const completedOrderSchema = new mongoose.Schema({
  table_number: { type: Number, required: true },
  orders: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      total_price: { type: Number, required: true },
      note: { type: String }, // New field added
    },
  ],
  total_bill: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model('CompletedOrder', completedOrderSchema)
