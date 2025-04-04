import type { Request, Response } from "express"
import User from "./user.model"
// @ts-ignore
import speakeasy from "speakeasy"
// @ts-ignore
import * as QRCode from "qrcode"
import { v4 as uuidv4 } from "uuid"
import * as bcrypt from "bcrypt"

// Enable MFA for a user
export const enableMFA = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id
    // @ts-ignore - req.user is added by auth middleware
    const userEmail = req.user.email

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `YourApp:${userEmail}`,
    })

    // Generate backup codes
    const backupCodes = Array(10)
      .fill(0)
      .map(() => {
        const code = uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase()
        return bcrypt.hashSync(code, 10)
      })

    // Save the secret and backup codes
    await User.findByIdAndUpdate(userId, {
      mfaSecret: secret.base32,
      backupCodes,
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

    // Return the secret and QR code
    res.status(200).json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes.map((_, i) => uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase()),
    })
  } catch (error) {
    console.error("Enable MFA error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Verify MFA token
export const verifyMFA = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body

    // Get the user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
    })

    if (!verified) {
      return res.status(401).json({ message: "Invalid MFA token" })
    }

    // Enable MFA for the user
    await User.findByIdAndUpdate(userId, {
      mfaEnabled: true,
    })

    res.status(200).json({ message: "MFA enabled successfully" })
  } catch (error) {
    console.error("Verify MFA error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Verify MFA during login
export const verifyMFALogin = async (req: Request, res: Response) => {
  try {
    const { email, token, backupCode } = req.body

    // Get the user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // If MFA is not enabled, return error
    if (!user.mfaEnabled) {
      return res.status(400).json({ message: "MFA not enabled for this user" })
    }

    let verified = false

    // Check if token is provided
    if (token) {
      verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token,
      })
    }

    // Check if backup code is provided
    if (!verified && backupCode) {
      // Find matching backup code
      const matchingCodeIndex = user.backupCodes.findIndex((code) => bcrypt.compareSync(backupCode, code))

      if (matchingCodeIndex !== -1) {
        verified = true

        // Remove used backup code
        const backupCodes = [...user.backupCodes]
        backupCodes.splice(matchingCodeIndex, 1)

        await User.findByIdAndUpdate(user._id, {
          backupCodes,
        })
      }
    }

    if (!verified) {
      return res.status(401).json({ message: "Invalid MFA token or backup code" })
    }

    res.status(200).json({ message: "MFA verification successful", userId: user._id })
  } catch (error) {
    console.error("Verify MFA login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

