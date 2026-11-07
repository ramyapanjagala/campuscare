const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * protect — verifies the Bearer JWT and attaches the authenticated
 * user document to req.user. Rejects requests with no/invalid token.
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
    const user = await User.findById(decoded.id)
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
