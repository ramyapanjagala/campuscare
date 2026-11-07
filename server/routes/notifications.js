const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const { protect } = require('../middleware/authMiddleware')

// GET /api/notifications/unread-count — badge count for the bell
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unread count', error: err.message })
  }
})

// GET /api/notifications — recent notifications for the current user (newest first)
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(25)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message })
  }
})

// PATCH /api/notifications/read-all — mark every notification as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read', error: err.message })
  }
})

module.exports = router
