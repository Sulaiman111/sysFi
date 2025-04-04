import mongoose, { Schema, type Document } from "mongoose"

export interface ITokenBlacklist extends Document {
  jti: string
  expiresAt: Date
}

const TokenBlacklistSchema: Schema = new Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index to automatically remove expired tokens
  },
})

export const TokenBlacklist = mongoose.model<ITokenBlacklist>("TokenBlacklist", TokenBlacklistSchema)

