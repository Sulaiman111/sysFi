import User from "./user.model"
import { Role } from "../role/role.model"
import mongoose from "mongoose"

// Repository pattern for user operations
export class UserRepository {
  // Get users by role with pagination
  static async getUsersByRole(role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const users = await User.find({ role }).select("-password").skip(skip).limit(limit).lean()

    const total = await User.countDocuments({ role })

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get users with specific permission
  static async getUsersWithPermission(permission: string) {
    // Find roles that have this permission
    const roles = await Role.find({ permissions: permission }).select("name").lean()

    const roleNames = roles.map((role) => role.name)

    // Find users with these roles
    const users = await User.find({ role: { $in: roleNames } })
      .select("-password")
      .lean()

    return users
  }

  // Get user with roles and permissions
  static async getUserWithPermissions(userId: string) {
    const user = await User.findById(userId).select("-password").lean()

    if (!user) {
      return null
    }

    const role = await Role.findOne({ name: user.role }).lean()

    return {
      ...user,
      permissions: role?.permissions || [],
    }
  }

  // Bulk update user roles
  static async bulkUpdateRoles(userIds: string[], role: string, adminId: string) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Update users
      const result = await User.updateMany({ _id: { $in: userIds } }, { role }, { session })

      // Log changes (in a real app, you'd create role change logs here)

      await session.commitTransaction()
      return result.modifiedCount
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}

