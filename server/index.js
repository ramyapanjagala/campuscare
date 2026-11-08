require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const complaintRoutes = require('./routes/complaints')
const authRoutes = require('./routes/auth')
const notificationRoutes = require('./routes/notifications')

const app = express()
const PORT = process.env.PORT || 5000

// CORS — allow local dev + any Vercel/Netlify frontend set via env var
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://campus-care-system.netlify.app',
  'https://campuscare-main.netlify.app',
]

// Add the production frontend URL from env if set (e.g. https://campuscare.vercel.app)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(express.json())

// Routes
app.use('/api/complaints', complaintRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusCare API is running' })
})

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
