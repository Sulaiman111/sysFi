import type { Request, Response, NextFunction } from "express"
import { RateLimiterMemory } from "rate-limiter-flexible"

// Create separate rate limiters for different endpoints
const loginRateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60, // per 60 seconds
})

const apiRateLimiter = new RateLimiterMemory({
  points: 30, // 30 requests
  duration: 60, // per 60 seconds
})

// Rate limiter for login attempts
export const loginLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || ""

  try {
    await loginRateLimiter.consume(ip)
    next()
  } catch (error) {
    console.log(`[SECURITY] Rate limit exceeded for login from IP: ${ip}`)
    res.status(429).json({
      message: "Too many login attempts. Please try again later.",
    })
  }
}

// Rate limiter for API requests
export const apiLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || ""

  try {
    await apiRateLimiter.consume(ip)
    next()
  } catch (error) {
    console.log(`[SECURITY] API rate limit exceeded from IP: ${ip}`)
    res.status(429).json({
      message: "Too many requests. Please try again later.",
    })
  }
}

