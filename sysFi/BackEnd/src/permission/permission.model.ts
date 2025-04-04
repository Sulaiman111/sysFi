import mongoose, { Schema, type Document } from "mongoose"

export interface IPermission extends Document {
  name: string
  description: string
  resource: string
  action: "create" | "read" | "update" | "delete" | "manage"
  createdAt: Date
  updatedAt: Date
}

const PermissionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["create", "read", "update", "delete", "manage"],
      required: true,
    },
  },
  { timestamps: true },
)

export const Permission = mongoose.model<IPermission>("Permission", PermissionSchema)

