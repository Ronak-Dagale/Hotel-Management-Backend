const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const jwtSecret = 'MynameisRonakDagale$#'
const { authMiddleware, roleMiddleware } = require('../Middlewares/auth')

router.post(
  '/createUser',
  authMiddleware,
  roleMiddleware('owner'),
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('name', 'Name is required').not().isEmpty(),
    check('role', 'Role is required and must be either user or admin').isIn([
      'owner',
      'server',
      'cook',
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, phone, role } = req.body

    try {
      // Check if the user already exists
      let user = await User.findOne({ email })
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] })
      }

      // Encrypt the password
      const salt = await bcrypt.genSalt(10)
      const secPassword = await bcrypt.hash(password, salt)

      // Create the user
      user = new User({
        name,
        email,
        password: secPassword,
        phone,
        role,
      })

      await user.save()

      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      }

      jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err
        res.json({ token })
      })
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

router.post(
  '/loginUser',
  [
    check('phone', 'Phone number is required')
      .isLength({ min: 10 })
      .withMessage('Invalid phone number'),
    check('password', 'Password is required').exists(),
    check('role', 'Role is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { phone, password, role } = req.body

    try {
      // Find user by phone
      const user = await User.findOne({ phone })

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] })
      }

      // Compare the password
      const isPasswordMatch = await bcrypt.compare(password, user.password)

      if (!isPasswordMatch || user.role !== role) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] })
      }

      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      }

      const authToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' })
      res.json({ success: true, authToken, user })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
    }
  }
)

router.get(
  '/getEmployees',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    try {
      const employees = await User.find({ role: { $in: ['cook', 'server'] } })
      res.json(employees)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

router.delete(
  '/deleteEmployee/:id',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) {
        return res.status(404).json({ msg: 'User not found' })
      }
      await User.findByIdAndDelete(req.params.id)
      res.json({ msg: 'User removed' })
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// Update employee
router.put(
  '/updateEmployee/:id',
  authMiddleware,
  roleMiddleware('owner'),
  async (req, res) => {
    const { name, email, phone, role, password } = req.body

    const userFields = { name, email, phone, role, password }

    try {
      let user = await User.findById(req.params.id)
      if (!user) {
        return res.status(404).json({ msg: 'User not found' })
      }

      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: userFields },
        { new: true }
      )

      res.json(user)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})
module.exports = router
