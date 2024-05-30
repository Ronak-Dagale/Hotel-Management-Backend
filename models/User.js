const mongoose = require('mongoose')

const { Schema } = mongoose

const UserSchema = new Schema({
    name: {
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
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['owner', 'server','cook'], // Specify possible roles
    },
    date: {
      type: Date,
      default: Date.now,
    },
  })
  
  module.exports = mongoose.model('User', UserSchema)