import type { Request, Response } from "express"
import User from "./user.model"
import jwt from "jsonwebtoken"
import { RoleChangeLog } from "./roleChangeLog.model"
import { v4 as uuidv4 } from "uuid"
import { TokenBlacklist } from './tokenBlacklist.model'

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

// Enhanced JWT token generation
const generateToken = (user: any) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    // Add a unique token ID to allow for token revocation
    jti: uuidv4(),
    // Add token version for forced logout
    tokenVersion: user.tokenVersion || 0,
  }

  return jwt.sign(
    payload, 
    JWT_SECRET, 
    {
      expiresIn: JWT_EXPIRES_IN,
      // Add audience and issuer claims for additional security
      audience: "your-app-audience",
      issuer: "your-app-issuer",
    }
  )
}

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "customer", // Default to customer if no role provided
      tokenVersion: 0, // Initialize token version
    })

    await user.save()

    // Generate JWT token
    const token = generateToken(user)

    // Set token in HTTP-only cookie for better security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate enhanced JWT token
    const token = generateToken(user)

    // Set token in HTTP-only cookie for better security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Force logout by incrementing token version
export const forceLogout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    // Increment token version to invalidate all existing tokens
    const user = await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "User forced to logout successfully" })
  } catch (error) {
    console.error("Force logout error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password")
    res.status(200).json({ users })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { role } = req.body
    // @ts-ignore - req.user is added by auth middleware
    const adminId = req.user.id // The admin making the change

    // Validate role
    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        role,
        // Increment token version to force logout with new role
        $inc: { tokenVersion: 1 },
      },
      { new: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Log the role change for audit purposes
    await RoleChangeLog.create({
      userId: id,
      adminId,
      oldRole: user.role,
      newRole: role,
      timestamp: new Date(),
    })

    res.status(200).json({
      message: "User role updated successfully",
      user,
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id
    // @ts-ignore - req.user is added by auth middleware
    const tokenVersion = req.user.tokenVersion

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if token version matches
    if (tokenVersion !== (user as any).tokenVersion) {
      return res.status(401).json({ message: "Token version mismatch" })
    }

    // Generate a new JWT token
    const token = generateToken(user)

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      message: "Token refreshed successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Logout function to blacklist token
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const { jti, exp } = req.user

    // Add token to blacklist
    await TokenBlacklist.create({
      jti,
      expiresAt: new Date(exp * 1000), // Convert exp to Date
    })

    // Clear cookie
    res.clearCookie("token")

    res.status(200).json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update current user profile
export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id;
    const { name, email } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new user (admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "customer", // Default to customer if no role provided
      tokenVersion: 0, // Initialize token version
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Multi-Factor Authentication
export const verifyMFA = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify the token against the user's MFA secret
    // You'll need a library like 'speakeasy' for this
    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'hex',
      token: token
    });
    
    if (!verified) {
      return res.status(401).json({ message: "Invalid verification token" });
    }
    
    // Enable MFA for the user
    user.mfaEnabled = true;
    await user.save();
    
    res.status(200).json({ message: "MFA enabled successfully" });
  } catch (error) {
    console.error("Verify MFA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Enable Multi-Factor Authentication
export const enableMFA = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate a secret key for MFA
    const secret = require('crypto').randomBytes(20).toString('hex');
    
    // Update user with MFA secret
    user.mfaSecret = secret;
    user.mfaEnabled = false; // Not fully enabled until verified
    await user.save();
    
    // Return the secret to be used with authenticator app
    res.status(200).json({
      message: "MFA setup initiated",
      secret,
      // You might want to generate a QR code URL here for easier setup
      qrCodeUrl: `otpauth://totp/YourApp:${user.email}?secret=${secret}&issuer=YourApp`
    });
  } catch (error) {
    console.error("Enable MFA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Disable Multi-Factor Authentication
export const disableMFA = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is added by auth middleware
    const userId = req.user.id;
    const { token } = req.body;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If MFA is not enabled, return error
    if (!user.mfaEnabled) {
      return res.status(400).json({ message: "MFA is not enabled for this user" });
    }
    
    // Verify the token before disabling MFA for security
    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'hex',
      token: token
    });
    
    if (!verified) {
      return res.status(401).json({ message: "Invalid verification token" });
    }
    
    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = null; // Changed from undefined to null
    await user.save();
    
    res.status(200).json({ message: "MFA disabled successfully" });
  } catch (error) {
    console.error("Disable MFA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

