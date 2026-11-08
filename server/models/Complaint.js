const mongoose = require('mongoose')

/**
 * Complaint Model
 * MongoDB Collection: "complaints"
 *
 * Stores every complaint submitted by students.
 * Fields stored per document:
 *
 *  --- Identification ---
 *   - id           : human-readable complaint ID (CC001, CC002, ...)
 *   - title        : short complaint title
 *
 *  --- Student info (denormalized for fast display) ---
 *   - user         : ObjectId reference to students collection
 *   - studentName  : student's name at time of submission
 *   - studentId    : student's college roll number (if provided)
 *
 *  --- Complaint details ---
 *   - category     : type of issue (Hostel, Classroom, Electrical, etc.)
 *   - location     : campus location where the issue occurred
 *   - description  : full description of the issue
 *
 *  --- Status & management (updated by admin) ---
 *   - status       : Pending | In Progress | Resolved
 *   - priority     : Low | Medium | High
 *   - department   : department assigned to handle this complaint
 *   - assignedTo   : name of responsible staff member
 *   - remarks      : internal admin notes
 *   - resolution   : description of how the issue was resolved
 *
 *  --- Timestamps ---
 *   - createdAt    : when the complaint was submitted
 *   - updatedAt    : when the complaint was last modified
 */

async function generateComplaintId() {
  const count = await Complaint.countDocuments()
  return 'CC' + String(count + 1).padStart(3, '0')
}

const complaintSchema = new mongoose.Schema(
  {
    // Human-readable complaint ID
    id: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },

    // Reference to the student who submitted — links to "students" collection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
    },

    // Denormalized snapshot — kept for fast display without a join
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

    // ── Admin management fields ──────────────────────────────────────────────

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    department: {
      type: String,
      trim: true,
      default: '',
    },

    assignedTo: {
      type: String,
      trim: true,
      default: '',
    },

    remarks: {
      type: String,
      trim: true,
      default: '',
    },

    resolution: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,           // Adds createdAt and updatedAt automatically
    collection: 'complaints',  // Explicit collection name
  }
)

// Auto-generate CC001, CC002, ... before first save
complaintSchema.pre('save', async function (next) {
  if (!this.id) {
    this.id = await generateComplaintId()
  }
  next()
})

// Formatted date string for frontend display
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
