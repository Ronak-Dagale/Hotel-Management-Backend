const mongoose = require('mongoose')
const mongoURI = 'mongodb://localhost:27017/Hotel'

const mongoDB = async () => {
  try {
    const connect = await mongoose.connect(mongoURI)
    if (connect) {
      //console.log('Connected to MongoDB')
    } else {
      // console.log('Not Connected to MongoDB')
    }
  } catch (err) {
    //console.error('Error connecting to MongoDB:', err)
  }
}

module.exports = mongoDB
