"use client"

import type React from "react"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { useToast, ToastProvider } from "@/lib/hooks/useToast"
import { ToastContainer } from "../ui/Toast"

function PageLayoutContent({ children }: { children: React.ReactNode }) {
  const { toasts } = useToast()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 max-w-7xl mx-auto">{children}</main>
      <Footer />
      <ToastContainer toasts={toasts} />
    </>
  )
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <PageLayoutContent>{children}</PageLayoutContent>
    </ToastProvider>
  )
}
