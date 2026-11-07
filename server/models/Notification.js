const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    // The user who receives this notification (student or admin)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Related complaint (optional, for linking)
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    // Display complaint id, e.g. CC001 (denormalized for quick display)
    complaintId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Notification',
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
