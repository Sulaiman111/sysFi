import express from "express"
import * as userController from "./user.controller"
import { authenticateToken } from "../middleware/auth.middleware"
import { hasPermission, hasAnyPermission } from "../middleware/permission.middleware"
import { Request, Response, NextFunction } from "express"

const router = express.Router()

// Updated helper function to handle middleware properly
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

// Auth routes
router.post("/register", asyncHandler(userController.register))
router.post("/login", asyncHandler(userController.login))
router.post("/logout", authenticateToken, asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await userController.logout(req, res, next);
}))
router.post("/refresh-token", authenticateToken, asyncHandler(userController.refreshToken))

// User profile routes
router.get("/me", authenticateToken, asyncHandler(userController.getCurrentUser))
router.put("/me", authenticateToken, asyncHandler(userController.updateCurrentUser))
router.put("/me/password", authenticateToken, asyncHandler(userController.updatePassword))

// User management routes (admin only)
router.get(
  "/users", 
  authenticateToken, 
  hasPermission("users:read"), 
  asyncHandler(userController.getAllUsers)
)

router.get(
  "/users/:id", 
  authenticateToken, 
  hasPermission("users:read"), 
  asyncHandler(userController.getUserById)
)

router.post("/users", authenticateToken, hasPermission("users:create"), asyncHandler(userController.createUser))

router.put("/users/:id", authenticateToken, hasPermission("users:update"), asyncHandler(userController.updateUser))

router.delete("/users/:id", authenticateToken, hasPermission("users:delete"), asyncHandler(userController.deleteUser))

// Role management routes
router.put("/users/:id/role", authenticateToken, hasPermission("roles:assign"), asyncHandler(userController.updateUserRole))

// Force logout route (admin only)
router.post(
  "/users/:id/force-logout",
  authenticateToken,
  hasAnyPermission(["users:manage", "security:manage"]),
  asyncHandler(userController.forceLogout)
)

// MFA routes
router.post("/mfa/enable", authenticateToken, asyncHandler(userController.enableMFA))
router.post("/mfa/verify", authenticateToken, asyncHandler(userController.verifyMFA))
router.post("/mfa/disable", authenticateToken, asyncHandler(userController.disableMFA))

export default router

