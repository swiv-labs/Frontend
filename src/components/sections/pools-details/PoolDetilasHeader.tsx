"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Pool } from "@/lib/types/models"

interface PoolDetailsHeaderProps {
  pool: Pool
}

/**
 * Pool details header
 * Displays pool name, status, and key metadata
 */
export function PoolDetailsHeader({ pool }: PoolDetailsHeaderProps) {
  const getStatusBadge = (status: Pool["status"]) => {
    const styles = {
      active: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-600", label: "Active" },
      resolved: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-600", label: "Resolved" },
      settled: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-600", label: "Settled" },
      closed: { bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-600", label: "Closed" },
    }

    const style = styles[status]
    return (
      <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${style.bg} ${style.border} ${style.text}`}>
        {style.label}
      </div>
    )
  }

  const timeRemaining = Math.max(0, pool.end_time - Math.floor(Date.now() / 1000))
  const hoursRemaining = Math.floor(timeRemaining / 3600)
  const minutesRemaining = Math.floor((timeRemaining % 3600) / 60)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/pools" className="hover:text-primary transition-smooth">
          Pools
        </Link>
        <span>/</span>
        <span className="text-foreground">{pool.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{pool.name}</h1>
            {getStatusBadge(pool.status)}
          </div>
          <p className="text-muted-foreground mb-4">Pool ID: <span className="font-mono text-primary font-semibold">{pool.pool_id}</span></p>

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Participants</p>
              <p className="text-lg font-bold text-foreground">{pool.total_participants}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vault Balance</p>
              <p className="text-lg font-bold font-mono text-foreground">{(pool.vault_balance / 1_000_000).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Time Left</p>
              <p className="text-lg font-bold text-foreground">{hoursRemaining}h {minutesRemaining}m</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bonus (bps)</p>
              <p className="text-lg font-bold font-mono text-foreground">{pool.conviction_bonus_bps}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
