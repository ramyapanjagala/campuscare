/**
 * Securely create an admin account from the command line.
 *
 * Usage:
 *   npm run create-admin -- "Admin Name" admin@campus.edu "Admin@123"
 *
 *   node scripts/createAdmin.js "Campus Admin" admin@campus.edu "Admin@123"
 *
 * If an admin already exists with the given email the password is updated.
 * If a *student* exists with the email the script refuses and asks for a
 * different email (admins are never created through public registration).
 */
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

async function createAdmin() {
  const name = process.argv[2]
  const email = process.argv[3]
  const password = process.argv[4]

  if (!name || !email || !password) {
    console.error(
      'Usage: npm run create-admin -- "<Admin Name>" admin@example.com "password"'
    )
    console.error(
      '  e.g. npm run create-admin -- "Campus Admin" admin@campus.edu "Admin@123"'
    )
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const existing = await User.findOne({ email: email.toLowerCase() })

    if (existing) {
      if (existing.role === 'admin') {
        console.log('ℹ️  Admin already exists with this email — updating password...')
        existing.password = password
        await existing.save()
        console.log('✅ Admin password updated successfully')
      } else {
        console.error(
          '❌ A student account already uses this email. Choose a different email for the admin.'
        )
      }
    } else {
      const admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
      })
      console.log('✅ Admin account created successfully!')
      console.log(`   Name:  ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Role:  ${admin.role}`)
      console.log('   You can now log in at the admin login page.')
    }
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdmin()
