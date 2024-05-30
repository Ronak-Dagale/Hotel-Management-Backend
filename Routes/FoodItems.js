// routes/foodItemRouter.js
const express = require('express')
const router = express.Router()
const FoodItem = require('../models/Items')
const { authMiddleware, roleMiddleware } = require('../Middlewares/auth')

// Get all food items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const foodItems = await FoodItem.find()
    res.json(foodItems)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Add a new food item
router.post(
  '/add',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const { name, category, price, status } = req.body
    try {
      const newFoodItem = new FoodItem({ name, category, price, status })
      await newFoodItem.save()
      res.status(201).json(newFoodItem)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// Update a food item by ID
router.put(
  '/update/:id',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const { name, category, price, status } = req.body
    try {
      let foodItem = await FoodItem.findById(req.params.id)
      if (!foodItem) {
        return res.status(404).json({ msg: 'Food item not found' })
      }

      foodItem.name = name
      foodItem.category = category
      foodItem.price = price
      foodItem.status = status
      await foodItem.save()
      res.json(foodItem)
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
    }
  }
)

// Delete a food item by ID
router.delete(
  '/delete/:id',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    try {
      let foodItem = await FoodItem.findById(req.params.id)
      if (!foodItem) {
        return res.status(404).json({ msg: 'Food item not found' })
      }

      await FoodItem.findByIdAndDelete(req.params.id)
      res.json({ msg: 'Food item removed' })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router
