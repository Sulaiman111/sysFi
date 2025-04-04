"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

// Define user type with role
interface User {
  id: string
  name: string
  email: string
  role: "admin" | "customer"
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
  isCustomer: () => boolean
  refreshToken: () => Promise<void>
  isTokenExpiringSoon: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null)
  const router = useRouter()

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))

      // Set authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`

      // Parse the JWT to get the expiration time
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]))
        setTokenExpiry(payload.exp * 1000) // Convert to milliseconds
      } catch (error) {
        console.error("Failed to parse token:", error)
      }
    }

    setIsLoading(false)
  }, [])

  // Check if token is about to expire
  const isTokenExpiringSoon = () => {
    if (!tokenExpiry) return false

    // Check if token expires in less than 5 minutes
    return tokenExpiry - Date.now() < 5 * 60 * 1000
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await axios.post("/api/auth/refresh")
      const { token } = response.data

      // Update token in state and localStorage
      setToken(token)
      localStorage.setItem("token", token)

      // Update expiry
      const payload = JSON.parse(atob(token.split(".")[1]))
      setTokenExpiry(payload.exp * 1000)

      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } catch (error) {
      // If refresh fails, log the user out
      logout()
    }
  }

  // Use an effect to refresh the token when it's about to expire
  useEffect(() => {
    if (isTokenExpiringSoon() && token) {
      refreshToken()
    }
  }, [tokenExpiry, token])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post("/api/auth/login", { email, password })

      const { token, user } = response.data

      // Save to state
      setToken(token)
      setUser(user)

      // Parse the JWT to get the expiration time
      const payload = JSON.parse(atob(token.split(".")[1]))
      setTokenExpiry(payload.exp * 1000) // Convert to milliseconds

      // Save to localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      })

      const { token, user } = response.data

      // Save to state
      setToken(token)
      setUser(user)

      // Parse the JWT to get the expiration time
      const payload = JSON.parse(atob(token.split(".")[1]))
      setTokenExpiry(payload.exp * 1000) // Convert to milliseconds

      // Save to localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Redirect based on role (usually customer for new registrations)
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear state
    setUser(null)
    setToken(null)
    setTokenExpiry(null)

    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Clear authorization header
    delete axios.defaults.headers.common["Authorization"]

    // Redirect to login
    router.push("/login")
  }

  // Helper functions to check roles
  const isAdmin = () => user?.role === "admin"
  const isCustomer = () => user?.role === "customer"

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAdmin,
    isCustomer,
    refreshToken,
    isTokenExpiringSoon,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

