import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import "@testing-library/jest-dom"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/components/auth-provider"
import { expect } from '@jest/globals'

// Mock the auth provider
jest.mock("@/components/auth-provider", () => ({
  useAuth: jest.fn(),
}))

describe("RoleGuard", () => {
  // Test case: User has allowed role
  it("renders children when user has allowed role", () => {
    // Mock the auth hook to return an admin user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
    })

    render(
      <RoleGuard allowedRoles={["admin"]}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>,
    )

    // Check that the protected content is rendered
expect(screen.getByTestId("protected-content")).toBeDefined()
  })

  // Test case: User does not have allowed role
  it("renders fallback when user does not have allowed role", () => {
    // Mock the auth hook to return a customer user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: "2", name: "Customer User", email: "customer@example.com", role: "customer" },
    })

    render(
      <RoleGuard allowedRoles={["admin"]} fallback={<div data-testid="fallback-content">Access Denied</div>}>
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>,
    )

    // Check that the fallback content is rendered
    expect(screen.getByTestId("fallback-content")).toBeDefined()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  // Test case: No user
  it("renders fallback when no user is authenticated", () => {
    // Mock the auth hook to return no user
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
    })

    render(
      <RoleGuard
        allowedRoles={["admin", "customer"]}
        fallback={<div data-testid="fallback-content">Access Denied</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </RoleGuard>,
    )

    // Check that the fallback content is rendered
    expect(screen.getByTestId("fallback-content")).toBeDefined()
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })
})

