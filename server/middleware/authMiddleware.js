const jwt = require('jsonwebtoken')
const Student = require('../models/Student')
const Admin = require('../models/Admin')

/**
 * protect — verifies the Bearer JWT and attaches the authenticated
 * user document to req.user. Looks in the students collection first,
 * then the admins collection, so both roles are supported.
 */
async function protect(req, res, next) {
  let token

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Look up the user in the correct collection based on the role in the token
    let user = null
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id)
    } else {
      user = await Student.findById(decoded.id)
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

/**
 * adminOnly — must run AFTER protect. Allows only admin users through.
 */
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({ message: 'Admin access required' })
}

module.exports = { protect, adminOnly }
