import mongoose, { Schema, type Document } from "mongoose"

export interface IRoleChangeLog extends Document {
  userId: mongoose.Types.ObjectId
  adminId: mongoose.Types.ObjectId
  oldRole: string
  newRole: string
  timestamp: Date
}

const RoleChangeLogSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  oldRole: {
    type: String,
    required: true,
  },
  newRole: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export const RoleChangeLog = mongoose.model<IRoleChangeLog>("RoleChangeLog", RoleChangeLogSchema)

