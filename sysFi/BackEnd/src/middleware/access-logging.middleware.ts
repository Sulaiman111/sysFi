import type { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"

// Define access log schema
const AccessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userRole: String,
  method: String,
  path: String,
  statusCode: Number,
  responseTime: Number,
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export const AccessLog = mongoose.model("AccessLog", AccessLogSchema)

// Middleware to log access attempts
export const accessLogger = (req: Request, res: Response, next: NextFunction) => {
  // Record start time
  const startTime = Date.now()

  // Store original end method
  const originalEnd = res.end

  // Override end method to capture status code and log access
  res.end = function (chunk?: any, encoding?: any, callback?: any) {
    // Calculate response time
    const responseTime = Date.now() - startTime

    // Create access log
    const logData = {
      // @ts-ignore - req.user is added by auth middleware
      userId: req.user?.id,
      // @ts-ignore - req.user is added by auth middleware
      userRole: req.user?.role || "unauthenticated",
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    }

    // Save access log asynchronously (don't wait for it)
    AccessLog.create(logData).catch((err) => {
      console.error("Error saving access log:", err)
    })

    // Call original end method
    return originalEnd.call(this, chunk, encoding, callback)
  }

  next()
}

