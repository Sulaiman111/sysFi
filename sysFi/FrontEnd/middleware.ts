import { type NextRequest, NextResponse } from "next/server"

// Define paths that require authentication
const authRequiredPaths = ["/dashboard", "/admin"]

// Define admin-only paths
const adminOnlyPaths = ["/admin"]

// Define customer-only paths
const customerOnlyPaths = ["/dashboard/customer"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // Check if path requires authentication
  const isAuthRequired = authRequiredPaths.some((path) => pathname.startsWith(path))

  // If auth is required but no token exists, redirect to login
  if (isAuthRequired && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If token exists, check role-based access
  if (token) {
    try {
      // Parse the JWT payload (assuming it's a JWT token)
      // In production, you should verify the token signature
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())

      const userRole = payload.role

      // Check admin-only paths
      if (adminOnlyPaths.some((path) => pathname.startsWith(path)) && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Check customer-only paths
      if (customerOnlyPaths.some((path) => pathname.startsWith(path)) && userRole !== "customer") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
    } catch (error) {
      // If token parsing fails, redirect to login
      console.error("Token parsing error:", error)
      const url = new URL("/login", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
}

