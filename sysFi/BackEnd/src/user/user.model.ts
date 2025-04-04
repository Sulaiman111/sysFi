import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcrypt"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "customer" | "manager" // Added role field
  permissions: string[]
  mfaEnabled: boolean
  mfaSecret: string | null
  backupCodes: string[]
  comparePassword(candidatePassword: string): Promise<boolean>
}

// Enhanced user schema with permissions
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "customer"],
      default: "customer",
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "create:users",
          "read:users",
          "update:users",
          "delete:users",
          "create:orders",
          "read:orders",
          "update:orders",
          "delete:orders",
          // Add more permissions as needed
        ],
      },
    ],
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      default: null,
    },
    backupCodes: [{ type: String }],
  },
  { timestamps: true },
)

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(String(this.password), salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Add a pre-save hook to set default permissions based on role
UserSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    switch (this.role) {
      case "admin":
        this.permissions = [
          "create:users",
          "read:users",
          "update:users",
          "delete:users",
          "create:orders",
          "read:orders",
          "update:orders",
          "delete:orders",
        ]
        break
      case "manager":
        this.permissions = ["read:users", "create:orders", "read:orders", "update:orders"]
        break
      case "customer":
        this.permissions = ["read:orders", "create:orders"]
        break
    }
  }
  next()
})

export default mongoose.model<IUser>("User", UserSchema)

