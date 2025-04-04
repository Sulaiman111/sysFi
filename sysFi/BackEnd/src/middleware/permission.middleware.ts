import type { Request, Response, NextFunction } from "express"
import User from "../user/user.model"
import { Role } from "../role/role.model"
import { RoleHierarchy } from "../role/role-hierarchy.model"

// Middleware to check if user has specific permission
export const hasPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - req.user is added by auth middleware
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" })
      }

      // Get user with role
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Get user's role
      const role = await Role.findOne({ name: user.role })
      if (!role) {
        return res.status(403).json({ message: "Role not found" })
      }

      // Check if role has the required permission
      if (role.permissions.includes(requiredPermission)) {
        return next()
      }

      // Check parent roles (role inheritance)
      const roleHierarchies = await RoleHierarchy.find({ childRole: role._id }).populate("parentRole")

      // Check if any parent role has the required permission
      for (const hierarchy of roleHierarchies) {
        const parentRole = hierarchy.parentRole as any
        if (parentRole.permissions.includes(requiredPermission)) {
          return next()
        }
      }

      // If we get here, user doesn't have the required permission
      return res.status(403).json({
        message: `Access denied. Required permission: ${requiredPermission}`,
      })
    } catch (error) {
      console.error("Permission check error:", error)
      return res.status(500).json({ message: "Server error" })
    }
  }
}

// Middleware to check if user has any of the specified permissions
export const hasAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - req.user is added by auth middleware
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" })
      }

      // Get user with role
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Get user's role
      const role = await Role.findOne({ name: user.role })
      if (!role) {
        return res.status(403).json({ message: "Role not found" })
      }

      // Check if role has any of the required permissions
      for (const permission of permissions) {
        if (role.permissions.includes(permission)) {
          return next()
        }
      }

      // Check parent roles (role inheritance)
      const roleHierarchies = await RoleHierarchy.find({ childRole: role._id }).populate("parentRole")

      // Check if any parent role has any of the required permissions
      for (const hierarchy of roleHierarchies) {
        const parentRole = hierarchy.parentRole as any
        for (const permission of permissions) {
          if (parentRole.permissions.includes(permission)) {
            return next()
          }
        }
      }

      // If we get here, user doesn't have any of the required permissions
      return res.status(403).json({
        message: `Access denied. Required one of these permissions: ${permissions.join(", ")}`,
      })
    } catch (error) {
      console.error("Permission check error:", error)
      return res.status(500).json({ message: "Server error" })
    }
  }
}

