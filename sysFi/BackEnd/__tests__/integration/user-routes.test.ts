import request from "supertest"
import mongoose from "mongoose"
import { app } from "../../src/app.js"
import User from "../../src/user/user.model"
import jwt from "jsonwebtoken"
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe("User API Routes", () => {
  let adminToken: string
  let customerToken: string
  let adminUserId: string
  let customerUserId: string

  // Setup before tests
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/test-db")

    // Clear users collection
    await User.deleteMany({})

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    })
    await adminUser.save()
    adminUserId = (adminUser._id as mongoose.Types.ObjectId).toString()

    // Create customer user
    const customerUser = new User({
      name: "Customer User",
      email: "customer@example.com",
      password: "password123",
      role: "customer",
    })
    await customerUser.save()
    customerUserId = (customerUser._id as mongoose.Types.ObjectId).toString()

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: "admin" },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" },
    )

    customerToken = jwt.sign(
      { id: customerUser._id, email: customerUser.email, role: "customer" },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" },
    )
  })

  // Cleanup after tests
  afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
  })

  // Test: Get all users (admin only)
  describe("GET /api/user/users", () => {
    it("should allow admin to get all users", async () => {
      const response = await request(app).get("/api/user/users").set("Authorization", `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.users).toBeDefined()
      expect(response.body.users.length).toBe(2)
    })

    it("should not allow customer to get all users", async () => {
      const response = await request(app).get("/api/user/users").set("Authorization", `Bearer ${customerToken}`)

      expect(response.status).toBe(403)
    })

    it("should not allow unauthenticated request", async () => {
      const response = await request(app).get("/api/user/users")

      expect(response.status).toBe(401)
    })
  })

  // Test: Update user role (admin only)
  describe("PUT /api/user/users/:id/role", () => {
    it("should allow admin to update user role", async () => {
      const response = await request(app)
        .put(`/api/user/users/${customerUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "manager" })

      expect(response.status).toBe(200)
      expect(response.body.user.role).toBe("manager")

      // Verify role was updated in database
      const updatedUser = await User.findById(customerUserId)
      expect(updatedUser?.role).toBe("manager")
    })

    it("should not allow customer to update user role", async () => {
      const response = await request(app)
        .put(`/api/user/users/${adminUserId}/role`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ role: "customer" })

      expect(response.status).toBe(403)

      // Verify role was not updated in database
      const adminUser = await User.findById(adminUserId)
      expect(adminUser?.role).toBe("admin")
    })

    it("should validate role input", async () => {
      const response = await request(app)
        .put(`/api/user/users/${customerUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "invalid-role" })

      expect(response.status).toBe(400)
    })
  })
})

