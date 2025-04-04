import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { TokenBlacklist } from "../user/tokenBlacklist.model"
import User from "../user/user.model"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // Use environment variable for security

interface DecodedToken {
  id: string
  email: string
  role: string
  tokenVersion: number
  jti: string
  iat: number
  exp: number
}

// Enhanced authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1])

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." })
  }

  try {
    // Verify token with additional options
    const decoded = jwt.verify(token, JWT_SECRET, {
      audience: "your-app-audience",
      issuer: "your-app-issuer",
    }) as DecodedToken

    // Check if token is in blacklist (for immediate revocation)
    const isBlacklisted = await TokenBlacklist.findOne({ jti: decoded.jti })
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token has been revoked",
      })
    }

    // Check token version against user's current token version
    const user = await User.findById(decoded.id)
    if (!user || (user as any).tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        message: "Token version mismatch. Please login again.",
      })
    }

    // Set user in request
    (req as any).user = decoded

    // Log successful authentication
    console.log(`[AUTH] User ${decoded.email} (${decoded.role}) authenticated`)

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(403).json({ message: "Invalid token" })
  }
}

