import type { Request, Response } from "express"
import { RoleRequest } from "./role-request.model"
import User from "./user.model"
import { RoleChangeLog } from "./roleChangeLog.model"

// Create a role change request
export const createRoleRequest = async (req: Request, res: Response) => {
  try {
    const { userId, requestedRole, reason } = req.body
    // @ts-ignore - req.user is added by auth middleware
    const requestedBy = req.user.id

    // Get the user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Create the request
    const roleRequest = new RoleRequest({
      userId,
      requestedBy,
      currentRole: user.role,
      requestedRole,
      reason,
    })

    await roleRequest.save()

    res.status(201).json({
      message: "Role change request created successfully",
      roleRequest,
    })
  } catch (error) {
    console.error("Create role request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Approve a role change request
export const approveRoleRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, comments } = req.body
    // @ts-ignore - req.user is added by auth middleware
    const approvedBy = req.user.id

    // Get the request
    const roleRequest = await RoleRequest.findById(requestId)
    if (!roleRequest) {
      return res.status(404).json({ message: "Role request not found" })
    }

    // Check if request is already processed
    if (roleRequest.status !== "pending") {
      return res.status(400).json({ message: "Role request already processed" })
    }

    // Update the request
    roleRequest.status = "approved"
    roleRequest.approvedBy = approvedBy
    roleRequest.comments = comments

    await roleRequest.save()

    // Update the user's role
    const user = await User.findByIdAndUpdate(roleRequest.userId, { role: roleRequest.requestedRole }, { new: true })

    // Log the role change
    await RoleChangeLog.create({
      userId: roleRequest.userId,
      adminId: approvedBy,
      oldRole: roleRequest.currentRole,
      newRole: roleRequest.requestedRole,
      timestamp: new Date(),
    })

    res.status(200).json({
      message: "Role change request approved successfully",
      roleRequest,
      user,
    })
  } catch (error) {
    console.error("Approve role request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Reject a role change request
export const rejectRoleRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, comments } = req.body
    // @ts-ignore - req.user is added by auth middleware
    const rejectedBy = req.user.id

    // Get the request
    const roleRequest = await RoleRequest.findById(requestId)
    if (!roleRequest) {
      return res.status(404).json({ message: "Role request not found" })
    }

    // Check if request is already processed
    if (roleRequest.status !== "pending") {
      return res.status(400).json({ message: "Role request already processed" })
    }

    // Update the request
    roleRequest.status = "rejected"
    roleRequest.rejectedBy = rejectedBy
    roleRequest.comments = comments

    await roleRequest.save()

    res.status(200).json({
      message: "Role change request rejected successfully",
      roleRequest,
    })
  } catch (error) {
    console.error("Reject role request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get all role change requests
export const getRoleRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }

    // Get requests
    const roleRequests = await RoleRequest.find(query)
      .populate("userId", "name email")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({ roleRequests })
  } catch (error) {
    console.error("Get role requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

