const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/authMiddleware')

// Create a signed JWT for a user
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Public response shape — never expose the password hash
function publicUser(user, token) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    ...(token ? { token } : {}),
  }
}

// POST /api/auth/register — students only, role forced to "student"
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const user = await User.create({
      name,
      email,
      password,
      studentId: studentId || '',
      // role intentionally omitted → defaults to "student"
    })

    const token = generateToken(user)
    res.status(201).json(publicUser(user, token))
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' })
    }
    res.status(500).json({ message: 'Registration failed', error: err.message })
  }
})

// POST /api/auth/login — works for both students and admins
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // password has select:false, so we explicitly request it
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user)
    res.json(publicUser(user, token))
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
})

// GET /api/auth/me — returns the currently authenticated user
router.get('/me', protect, async (req, res) => {
  res.json(publicUser(req.user))
})

module.exports = router
