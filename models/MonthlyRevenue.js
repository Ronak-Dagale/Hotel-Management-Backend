const mongoose = require('mongoose')

const monthlyRevenueSchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g., '2023-07'
  revenue: { type: Number, required: true, default: 0 },
})

module.exports = mongoose.model('MonthlyRevenue', monthlyRevenueSchema)
