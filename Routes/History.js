const express = require('express')
const router = express.Router()
const History = require('../models/CompletedOrder')
const { authMiddleware, roleMiddleware } = require('../Middlewares/auth')

router.get('/', authMiddleware, roleMiddleware('owner'), async (req, res) => {
  try {
    const completedOrders = await History.find()
    res.json(completedOrders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server Error' })
  }
})

router.get(
  '/:orderId',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const orderId = req.params.orderId
    try {
      const order = await History.findById(orderId)
      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }
      res.json(order)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server Error' })
    }
  }
)

router.delete(
  '/',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    try {
      await History.deleteMany()
      res.json({ message: 'All completed orders have been deleted' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server Error' })
    }
  }
)

module.exports = router
