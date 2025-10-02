import jwt from 'jsonwebtoken'

export const generateToken = (payload, secret, options) => {
  return jwt.sign(payload, secret, options)
}

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch (err) {
    console.error("JWT verify error:", err.message)
    return null
  }
}
