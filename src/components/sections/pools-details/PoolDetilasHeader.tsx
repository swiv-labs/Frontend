"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Pool } from "@/lib/store/slices/poolsSlice"
import { useAppSelector } from "@/lib/store/hooks"

interface PoolDetailsHeaderProps {
  pool: Pool
  onPredict: () => void
}

export function PoolDetailsHeader({ pool, onPredict }: PoolDetailsHeaderProps) {
  const { isConnected } = useAppSelector((state) => state.wallet)

  const getStatusBadge = (status: Pool["status"]) => {
    const styles = {
      ongoing: "bg-green-500/10 border-green-500/20 text-green-400",
      upcoming: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      closed: "bg-gray-500/10 border-gray-500/20 text-gray-400",
    }

    const labels = {
      ongoing: "Live",
      upcoming: "Upcoming",
      closed: "Closed",
    }

    return <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${styles[status]}`}>{labels[status]}</div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/pools" className="hover:text-primary transition-smooth">
          Pools
        </Link>
        <span>/</span>
        <span className="text-foreground">Bitcoin Price...</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-4xl">
            <img src={"https://storage.trepa.app/76a5077a-b392-4af2-b226-36efaea2a65e.webp"} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Bitcoin Price at 11:59 PM UTC on January 27, 2026</h1>
              {getStatusBadge(pool.status)}
            </div>
            <p className="text-muted-foreground">{pool.symbol}/USD Prediction Pool</p>
          </div>
        </div>

        {pool.status !== "closed" && (
          <button
            onClick={onPredict}
            disabled={!isConnected}
            className="px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl transition-smooth hover:shadow-xl hover:shadow-primary/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnected ? "Make Prediction" : "Connect Wallet"}
          </button>
        )}
      </div>
    </motion.div>
  )
}
