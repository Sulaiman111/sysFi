import mongoose, { Schema, type Document } from "mongoose"

export interface IRoleHierarchy extends Document {
  parentRole: mongoose.Types.ObjectId
  childRole: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RoleHierarchySchema: Schema = new Schema(
  {
    parentRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    childRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  { timestamps: true },
)

// Create a compound index for parentRole and childRole
RoleHierarchySchema.index({ parentRole: 1, childRole: 1 }, { unique: true })

export const RoleHierarchy = mongoose.model<IRoleHierarchy>("RoleHierarchy", RoleHierarchySchema)

