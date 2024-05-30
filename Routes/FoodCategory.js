const express = require('express')
const router = express.Router()
const FoodCategory = require('../models/Category')
const { authMiddleware, roleMiddleware } = require('../Middlewares/auth')
// Create a new food category
router.post(
  '/add',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const { categoryname, status } = req.body
    try {
      const newCategory = new FoodCategory({ categoryname, status })
      await newCategory.save()
      res.status(201).json({ msg: 'Category added successfully' })
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// Get all food categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await FoodCategory.find()
    if (categories.length === 0) {
      return res.status(404).json({ msg: 'No Categories found' })
    }
    res.json(categories)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Update a food category by ID
router.put(
  '/update/:id',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const { categoryname, status } = req.body
    try {
      let category = await FoodCategory.findById(req.params.id)
      if (!category) {
        return res.status(404).json({ msg: 'Category not found' })
      }

      category.categoryname = categoryname
      category.status = status
      await category.save()
      res.json(category)
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
    }
  }
)

// Delete a food category by ID
router.delete(
  '/delete/:id',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    try {
      let category = await FoodCategory.findById(req.params.id)
      if (!category) {
        return res.status(404).json({ msg: 'Category not found' })
      }

      await FoodCategory.findByIdAndDelete(req.params.id)
      res.json({ msg: 'Category removed' })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router
