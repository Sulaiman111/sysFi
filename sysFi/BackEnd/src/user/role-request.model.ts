import mongoose, { Schema, type Document } from "mongoose"

export interface IRoleRequest extends Document {
  userId: mongoose.Types.ObjectId
  requestedBy: mongoose.Types.ObjectId
  currentRole: string
  requestedRole: string
  status: "pending" | "approved" | "rejected"
  reason: string
  approvedBy?: mongoose.Types.ObjectId
  rejectedBy?: mongoose.Types.ObjectId
  comments?: string
  createdAt: Date
  updatedAt: Date
}

const RoleRequestSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentRole: {
      type: String,
      required: true,
    },
    requestedRole: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: {
      type: String,
    },
  },
  { timestamps: true },
)

export const RoleRequest = mongoose.model<IRoleRequest>("RoleRequest", RoleRequestSchema)

