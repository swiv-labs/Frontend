import type React from "react"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers/Providers"

const inter = Roboto({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: "400"
})

export const metadata: Metadata = {
  title: "Swiv - Prediction markets, but for privacy normies.",
  description: "Your predictions deserve privacy, Trade crypto and stock prices",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
