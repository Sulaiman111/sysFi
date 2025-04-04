import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth-provider'
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinMaster",
  description: "Manage invoices, customers, products, and deliveries with ease",
  generator: 'v0.dev',
  icons: {
    icon: './favicon.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="billflow-theme">
          <LanguageProvider defaultLanguage="en" storageKey="billflow-language">
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

