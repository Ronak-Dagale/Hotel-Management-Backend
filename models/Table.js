const mongoose = require('mongoose')
const { Schema } = mongoose

const OrderItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'ongoing', 'done'],
  },
  price: {
    type: Number,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  note: {
    type: String, // New field added
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const TableSchema = new Schema({
  table_number: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: ['running', ''], // Restrict to 'running' or empty string
  },
  order: [OrderItemSchema], // Embed OrderItemSchema as an array
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Table', TableSchema)
