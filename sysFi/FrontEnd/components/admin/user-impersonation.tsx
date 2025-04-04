"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import axios from "axios"

export function UserImpersonation() {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // Store original user info before impersonation
  const startImpersonation = async () => {
    try {
      setLoading(true)

      // Store current user in session storage
      sessionStorage.setItem("originalUser", JSON.stringify(user))

      // Call API to get impersonation token
      const response = await axios.post("/api/admin/impersonate", { email })

      // Save impersonation token and user
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("isImpersonating", "true")

      // Reload the page to apply changes
      window.location.href = "/dashboard"

      toast.success(`Now impersonating ${response.data.user.name}`)
    } catch (error) {
      console.error("Impersonation error:", error)
      toast.error("Failed to impersonate user")
    } finally {
      setLoading(false)
    }
  }

  // End impersonation and restore original user
  const endImpersonation = () => {
    // Get original user from session storage
    const originalUserJson = sessionStorage.getItem("originalUser")

    if (originalUserJson) {
      const originalUser = JSON.parse(originalUserJson)

      // Restore original user and token
      localStorage.setItem("token", originalUser.token)
      localStorage.setItem("user", JSON.stringify(originalUser))
      localStorage.removeItem("isImpersonating")
      sessionStorage.removeItem("originalUser")

      // Reload the page to apply changes
      window.location.href = "/admin/dashboard"

      toast.success("Impersonation ended")
    }
  }

  // Check if currently impersonating
  const isImpersonating = localStorage.getItem("isImpersonating") === "true"

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Impersonation</CardTitle>
      </CardHeader>
      <CardContent>
        {isImpersonating ? (
          <div className="space-y-4">
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded">You are currently impersonating a user</div>
            <Button onClick={endImpersonation} variant="destructive">
              End Impersonation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Enter a user's email to impersonate them. This allows you to see the application as they would see it.
            </div>
            <div className="flex gap-2">
              <Input placeholder="User email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={startImpersonation} disabled={loading || !email}>
                {loading ? "Loading..." : "Impersonate"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

