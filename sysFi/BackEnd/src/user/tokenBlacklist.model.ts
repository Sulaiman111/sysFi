import mongoose, { Schema, Document } from "mongoose";

export interface ITokenBlacklist extends Document {
  jti: string;
  expiresAt: Date;
  createdAt: Date;
}

const tokenBlacklistSchema = new Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // This will automatically remove documents when they expire
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create TTL index to automatically remove expired tokens
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model<ITokenBlacklist>("TokenBlacklist", tokenBlacklistSchema);