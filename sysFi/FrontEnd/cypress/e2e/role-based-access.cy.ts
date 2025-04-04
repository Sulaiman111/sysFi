/// <reference types="cypress" />

describe("Role-Based Access Control", () => {
    // Test admin login and access
    describe("Admin User", () => {
      beforeEach(() => {
        // Intercept API requests and mock responses
        cy.intercept('POST', '/api/auth/login', {
          statusCode: 200,
          body: {
            user: {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin'
            },
            token: 'fake-jwt-token'
          }
        }).as('loginRequest')
        
        // Login as admin
        cy.visit("/login")
        cy.get('input[name="email"]').type("admin@example.com")
        cy.get('input[name="password"]').type("password123")
        cy.get('button[type="submit"]').click()
        
        // Wait for the intercepted request
        cy.wait('@loginRequest')
  
        // Wait for redirect to admin dashboard
        cy.url().should("include", "/admin/dashboard")
      })
      
      // Rest of your tests remain the same
  
      it("should access admin dashboard", () => {
        cy.get("h1").should("contain", "Admin Dashboard")
      })
  
      it("should access user management page", () => {
        cy.visit("/admin/users")
        cy.get("h1").should("contain", "User Management")
        cy.get("table").should("exist")
      })
  
      it("should be able to change user roles", () => {
        cy.visit("/admin/users")
  
        // Find a customer user and change role
        cy.contains("tr", "customer@example.com").find("select").select("manager")
  
        // Verify success message
        cy.contains("User role updated successfully").should("be.visible")
  
        // Verify role was updated in the table
        cy.contains("tr", "customer@example.com").should("contain", "manager")
      })
    })
  
    // Test customer login and access
    describe("Customer User", () => {
      beforeEach(() => {
        // Login as customer
        cy.visit("/login")
        cy.get('input[name="email"]').type("customer@example.com")
        cy.get('input[name="password"]').type("password123")
        cy.get('button[type="submit"]').click()
  
        // Wait for redirect to customer dashboard
        cy.url().should("include", "/dashboard")
      })
  
      it("should access customer dashboard", () => {
        cy.get("h1").should("contain", "Customer Dashboard")
      })
  
      it("should not access admin dashboard", () => {
        // Try to visit admin dashboard
        cy.visit("/admin/dashboard")
  
        // Should be redirected to customer dashboard
        cy.url().should("include", "/dashboard")
        cy.url().should("not.include", "/admin")
      })
  
      it("should not see admin navigation items", () => {
        // Check that admin nav items are not visible
        cy.contains("a", "User Management").should("not.exist")
        cy.contains("a", "Analytics").should("not.exist")
      })
    })
  
    // Test unauthenticated access
    describe("Unauthenticated User", () => {
      it("should redirect to login when accessing protected routes", () => {
        // Try to visit dashboard
        cy.visit("/dashboard")
  
        // Should be redirected to login
        cy.url().should("include", "/login")
      })
  
      it("should redirect to login with callback URL", () => {
        // Try to visit admin dashboard
        cy.visit("/admin/dashboard")
  
        // Should be redirected to login with callback URL
        cy.url().should("include", "/login")
        cy.url().should("include", "callbackUrl=%2Fadmin%2Fdashboard")
      })
    })
  })
  
  