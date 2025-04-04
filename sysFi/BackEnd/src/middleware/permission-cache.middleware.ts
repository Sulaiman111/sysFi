import type { Request, Response, NextFunction } from "express"
import NodeCache from "node-cache"
import User from "../user/user.model"
import { Role } from "../role/role.model"

// Create cache with 5 minute TTL
const permissionCache = new NodeCache({ stdTTL: 300 })

// Helper function to check if user has permission
async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  // Check cache first
  const cacheKey = `${userId}:${permission}`
  const cachedResult = permissionCache.get<boolean>(cacheKey)

  if (cachedResult !== undefined) {
    return cachedResult
  }

  // Cache miss, check database
  const user = await User.findById(userId)
  if (!user) {
    return false
  }

  const role = await Role.findOne({ name: user.role })
  if (!role) {
    return false
  }

  const hasPermission = role.permissions.includes(permission)

  // Cache the result
  permissionCache.set(cacheKey, hasPermission)

  return hasPermission
}

// Middleware to check permission with caching
export const hasPermissionCached = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - req.user is added by auth middleware
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" })
      }

      const hasPermission = await checkUserPermission(userId, requiredPermission)

      if (hasPermission) {
        return next()
      }

      return res.status(403).json({
        message: `Access denied. Required permission: ${requiredPermission}`,
      })
    } catch (error) {
      console.error("Permission check error:", error)
      return res.status(500).json({ message: "Server error" })
    }
  }
}

// Function to invalidate user permission cache
export function invalidateUserPermissionCache(userId: string) {
  // Get all cache keys
  const keys = permissionCache.keys()

  // Filter keys that start with userId
  const userKeys = keys.filter((key) => key.startsWith(`${userId}:`))

  // Delete all matching keys
  permissionCache.del(userKeys)
}

