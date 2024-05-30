const jwt = require('jsonwebtoken')
const JWT_SECRET = 'MynameisRonakDagale$#'
const authMiddleware = (req, res, next) => {
  const tokenHeader = req.header('Authorization')
  // console.log(req)
  //console.log(tokenHeader)
  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    console.log('No token, authorization denied')
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  const token = tokenHeader.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ message: 'Token is not valid' })
  }
}
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ msg: 'Access denied' })
    }
    next()
  }
}

module.exports = { authMiddleware, roleMiddleware }
