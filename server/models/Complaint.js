const mongoose = require('mongoose')

// Auto-generate complaint IDs like CC001, CC002, etc.
async function generateComplaintId() {
  const count = await Complaint.countDocuments()
  return 'CC' + String(count + 1).padStart(3, '0')
}

const complaintSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    // Reference to the student who submitted this complaint
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Denormalized for fast display — populated from the user at creation
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Hostel', 'Classroom', 'Electrical', 'Water', 'Cleaning', 'Internet', 'Other'],
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    // ===== Faculty/Admin management fields =====
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    // Department assigned to handle this complaint
    department: {
      type: String,
      trim: true,
      default: '',
    },
    // Name of the responsible staff member assigned to it
    assignedTo: {
      type: String,
      trim: true,
      default: '',
    },
    // Admin remarks / internal notes
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    // Resolution details recorded when the issue is closed
    resolution: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

// Auto-assign the complaint ID before saving
complaintSchema.pre('save', async function (next) {
  if (!this.id) {
    this.id = await generateComplaintId()
  }
  next()
})

// Format date for frontend display
complaintSchema.virtual('date').get(function () {
  return this.createdAt
    ? new Date(this.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''
})

complaintSchema.set('toJSON', { virtuals: true })

const Complaint = mongoose.model('Complaint', complaintSchema)

module.exports = Complaint
