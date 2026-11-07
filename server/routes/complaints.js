const express = require('express')
const router = express.Router()
const Complaint = require('../models/Complaint')
const User = require('../models/User')
const Notification = require('../models/Notification')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// GET /api/complaints/public-stats — global stats, no auth (for the public home page)
// Must stay before any /:id route.
router.get('/public-stats', async (req, res) => {
  try {
    const [total, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
    ])
    res.json({ total, pending, inProgress, resolved })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message })
  }
})

// GET /api/complaints/stats — role-based stats (students see only their own)
router.get('/stats', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { user: req.user._id } : {}
    const [total, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Pending' }),
      Complaint.countDocuments({ ...filter, status: 'In Progress' }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
    ])
    res.json({ total, pending, inProgress, resolved })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message })
  }
})

// GET /api/complaints — students see only their own; admins see all
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { user: req.user._id } : {}
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 })
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: err.message })
  }
})

// GET /api/complaints/:id — students can only fetch their own complaint
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    if (
      req.user.role === 'student' &&
      complaint.user &&
      complaint.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' })
    }

    res.json(complaint)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaint', error: err.message })
  }
})

// POST /api/complaints — students only. Name/ID taken from the auth user.
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit complaints' })
    }

    const { title, category, location, description } = req.body

    const complaint = new Complaint({
      title,
      user: req.user._id,
      studentName: req.user.name,
      studentId: req.user.studentId || '',
      category,
      location,
      description,
    })

    const saved = await complaint.save()

    // Best-effort: notify all admins about the new complaint
    try {
      const admins = await User.find({ role: 'admin' }).select('_id')
      if (admins.length) {
        await Notification.insertMany(
          admins.map((a) => ({
            user: a._id,
            complaint: saved._id,
            complaintId: saved.id,
            title: 'New Complaint Submitted',
            message: `New complaint ${saved.id} submitted by ${saved.studentName}.`,
            status: 'Pending',
            read: false,
          }))
        )
      }
    } catch (notifyErr) {
      // Notifications are best-effort — never fail the complaint submission
      console.error('Notification creation failed:', notifyErr.message)
    }

    res.status(201).json(saved)
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    res.status(500).json({ message: 'Failed to save complaint', error: err.message })
  }
})

// PATCH /api/complaints/:id/status — admins only
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['Pending', 'In Progress', 'Resolved']
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const complaint = await Complaint.findOne({ id: req.params.id })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    const previousStatus = complaint.status
    complaint.status = status
    const saved = await complaint.save()

    // Notify the student only when the status actually changed
    if (previousStatus !== status && saved.user) {
      try {
        await Notification.create({
          user: saved.user,
          complaint: saved._id,
          complaintId: saved.id,
          title: 'Complaint Status Updated',
          message: `Your complaint ${saved.id} status changed to "${status}".`,
          status,
          read: false,
        })
      } catch (notifyErr) {
        console.error('Notification creation failed:', notifyErr.message)
      }
    }

    res.json(saved)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message })
  }
})

// PATCH /api/complaints/:id/manage — admins only.
// Updates any of the management fields: status, priority, department,
// assignedTo, remarks, resolution. Only provided fields are changed.
// Notifies the student when the status actually changes.
router.patch('/:id/manage', protect, adminOnly, async (req, res) => {
  try {
    const { status, priority, department, assignedTo, remarks, resolution } = req.body

    const complaint = await Complaint.findOne({ id: req.params.id })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    const previousStatus = complaint.status

    if (status !== undefined) {
      if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' })
      }
      complaint.status = status
    }
    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority value' })
      }
      complaint.priority = priority
    }
    if (department !== undefined) complaint.department = String(department).trim()
    if (assignedTo !== undefined) complaint.assignedTo = String(assignedTo).trim()
    if (remarks !== undefined) complaint.remarks = String(remarks).trim()
    if (resolution !== undefined) complaint.resolution = String(resolution).trim()

    const saved = await complaint.save()

    // Notify the student only when the status actually changed
    if (previousStatus !== saved.status && saved.user) {
      try {
        await Notification.create({
          user: saved.user,
          complaint: saved._id,
          complaintId: saved.id,
          title: 'Complaint Status Updated',
          message: `Your complaint ${saved.id} status changed to "${saved.status}".`,
          status: saved.status,
          read: false,
        })
      } catch (notifyErr) {
        console.error('Notification creation failed:', notifyErr.message)
      }
    }

    res.json(saved)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update complaint', error: err.message })
  }
})

module.exports = router
