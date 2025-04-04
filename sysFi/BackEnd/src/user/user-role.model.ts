import mongoose, { Schema, type Document } from "mongoose"

export interface IUserRole extends Document {
  userId: mongoose.Types.ObjectId
  roleId: mongoose.Types.ObjectId
  assignedBy: mongoose.Types.ObjectId
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserRoleSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Create a compound index for userId and roleId
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true })

export const UserRole = mongoose.model<IUserRole>("UserRole", UserRoleSchema)


