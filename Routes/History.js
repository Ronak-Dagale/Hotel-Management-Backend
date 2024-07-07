const express = require('express')
const router = express.Router()
const History = require('../models/CompletedOrder')
const { authMiddleware, roleMiddleware } = require('../Middlewares/auth')
const MonthlyRevenue = require('../models/MonthlyRevenue')

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
// Fetch daily revenue for the current month
router.get(
  '/revenue/daily',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    try {
      const startOfMonth = new Date(new Date().setDate(1))
      const endOfMonth = new Date(
        new Date().setMonth(startOfMonth.getMonth() + 1, 0)
      )

      const dailyRevenue = await History.aggregate([
        {
          $match: {
            timestamp: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: '$timestamp' },
            revenue: { $sum: '$total_bill' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            revenue: 1,
          },
        },
      ])

      res.json(dailyRevenue)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server Error' })
    }
  }
)

// Fetch monthly revenue for a given year
router.get(
  '/revenue/monthly/:year',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const { year } = req.params
    try {
      const monthlyRevenue = await MonthlyRevenue.find({
        month: { $regex: `^${year}-` },
      }).sort({ month: 1 })

      if (monthlyRevenue.length === 0) {
        return res
          .status(404)
          .json({ message: 'No data available for the selected year' })
      }

      res.json(monthlyRevenue)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server Error' })
    }
  }
)

module.exports = router
