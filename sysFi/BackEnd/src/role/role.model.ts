import mongoose, { Schema, type Document } from "mongoose"

export interface IRole extends Document {
  name: string
  description: string
  permissions: string[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const RoleSchema: Schema = new Schema(
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
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Role = mongoose.model<IRole>("Role", RoleSchema)

