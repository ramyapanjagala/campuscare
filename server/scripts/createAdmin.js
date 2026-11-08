/**
 * Create an admin account from the command line.
 * Admins are stored in the "admins" collection (separate from "students").
 *
 * Usage:
 *   npm run create-admin -- "Admin Name" admin@campus.edu "Admin@123"
 *   node scripts/createAdmin.js "Campus Admin" admin@campus.edu "Admin@123"
 */
require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('../models/Admin')
const Student = require('../models/Student')

async function createAdmin() {
  const name     = process.argv[2]
  const email    = process.argv[3]
  const password = process.argv[4]

  if (!name || !email || !password) {
    console.error('Usage: npm run create-admin -- "<Admin Name>" admin@example.com "password"')
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Prevent using an email that already belongs to a student
    const studentConflict = await Student.findOne({ email: email.toLowerCase() })
    if (studentConflict) {
      console.error('❌ This email is already registered as a student account.')
      process.exit(1)
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() })

    if (existing) {
      console.log('ℹ️  Admin already exists — updating password...')
      existing.password = password
      await existing.save()
      console.log('✅ Admin password updated successfully')
    } else {
      const admin = await Admin.create({ name, email, password })
      console.log('✅ Admin account created and stored in "admins" collection!')
      console.log(`   Name:  ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log('   You can now log in at the Admin Login tab.')
    }
  } catch (err) {
    console.error('❌ Failed:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdmin()
