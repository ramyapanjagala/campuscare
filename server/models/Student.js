const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

/**
 * Student Model
 * MongoDB Collection: "students"
 *
 * Stores login credentials and profile information for student users.
 * Fields stored per document:
 *   - name        : student's full name
 *   - email       : unique login email
 *   - password    : bcrypt-hashed password (never returned by default)
 *   - studentId   : college roll number / ID (optional)
 *   - createdAt   : account creation timestamp
 *   - updatedAt   : last update timestamp
 *
 * Note: role is NOT stored as a field — it is always "student" (virtual).
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,          // Never returned in API responses
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,         // Adds createdAt and updatedAt automatically
    collection: 'students',  // Explicit collection name
  }
)

// Hash the password before saving whenever it is new or changed
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare a plain-text password against the stored hash
studentSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// role is always "student" — computed, not stored in DB
studentSchema.virtual('role').get(function () {
  return 'student'
})

studentSchema.set('toJSON', { virtuals: true })
studentSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Student', studentSchema)
