const mongoose = require('mongoose');
const { Schema } = mongoose;

const FoodCategorySchema = new Schema({
  categoryname: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoodCategory', FoodCategorySchema);
