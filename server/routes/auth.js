const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Student = require('../models/Student')
const Admin = require('../models/Admin')
const { protect } = require('../middleware/authMiddleware')

// Create a signed JWT — encodes id, role and name
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Safe public shape — never exposes password hash
function publicUser(user, token) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId || '',
    ...(token ? { token } : {}),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a student account. Stored in the "students" collection.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    // Check both collections — email must be globally unique
    const existingStudent = await Student.findOne({ email: email.toLowerCase() })
    const existingAdmin   = await Admin.findOne({ email: email.toLowerCase() })
    if (existingStudent || existingAdmin) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const student = await Student.create({
      name,
      email,
      password,
      studentId: studentId || '',
    })

    const token = generateToken(student)
    res.status(201).json(publicUser(student, token))
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register-admin
// Creates an admin account. Stored in the "admins" collection.
// Requires the x-admin-secret header to prevent unauthorised admin creation.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register-admin', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret']
    const expectedSecret = process.env.ADMIN_SECRET || 'campuscare-admin-secret'
    if (!secret || secret !== expectedSecret) {
      return res.status(403).json({ message: 'Invalid or missing admin secret' })
    }

    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    // Check both collections — email must be globally unique
    const existingStudent = await Student.findOne({ email: email.toLowerCase() })
    const existingAdmin   = await Admin.findOne({ email: email.toLowerCase() })
    if (existingStudent || existingAdmin) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const admin = await Admin.create({ name, email, password })
    const token = generateToken(admin)
    res.status(201).json(publicUser(admin, token))
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' })
    }
    res.status(500).json({ message: 'Admin registration failed', error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Checks the students collection first, then admins collection.
// Returns the role so the frontend can redirect to the correct dashboard.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const lowerEmail = email.toLowerCase()

    // Try students collection first
    let user = await Student.findOne({ email: lowerEmail }).select('+password')

    // If not found as student, try admins collection
    if (!user) {
      user = await Admin.findOne({ email: lowerEmail }).select('+password')
    }

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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the currently authenticated user (student or admin).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json(publicUser(req.user))
})

module.exports = router
