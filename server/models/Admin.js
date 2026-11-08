const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

/**
 * Admin Model
 * MongoDB Collection: "admins"
 *
 * Stores login credentials and profile information for administrator users.
 * Fields stored per document:
 *   - name        : admin's full name
 *   - email       : unique login email
 *   - password    : bcrypt-hashed password (never returned by default)
 *   - createdAt   : account creation timestamp
 *   - updatedAt   : last update timestamp
 *
 * Note: role is NOT stored as a field — it is always "admin" (virtual).
 * Note: studentId is NOT stored — admins are not students.
 */
const adminSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,         // Adds createdAt and updatedAt automatically
    collection: 'admins',    // Explicit collection name
  }
)

// Hash the password before saving whenever it is new or changed
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare a plain-text password against the stored hash
adminSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// role is always "admin" — computed, not stored in DB
adminSchema.virtual('role').get(function () {
  return 'admin'
})

adminSchema.set('toJSON', { virtuals: true })
adminSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Admin', adminSchema)
