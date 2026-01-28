"use client"

import type { Pool } from "@/lib/types/models"
import Link from "next/link"
import { motion } from "framer-motion"

interface PoolsGridProps {
  pools: Pool[]
}

const getStatusColor = (status: Pool["status"]) => {
  switch (status) {
    case "active":
      return { bg: "bg-green-500/10", text: "text-green-600", label: "Active" }
    case "resolved":
      return { bg: "bg-blue-500/10", text: "text-blue-600", label: "Resolved" }
    case "settled":
      return { bg: "bg-purple-500/10", text: "text-purple-600", label: "Settled" }
    case "closed":
      return { bg: "bg-gray-500/10", text: "text-gray-600", label: "Closed" }
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", label: status }
  }
}

const formatTokenAmount = (lamports: number): string => {
  return (lamports / 1_000_000).toFixed(2)
}

/**
 * Pool grid component
 * Displays all pools with key information from backend schema
 */
export function PoolsGrid({ pools }: PoolsGridProps) {
  if (pools.length === 0) {
    return (
      <div className="py-32 text-center">
        <p className="text-muted-foreground mb-2">No pools found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pools.map((pool, idx) => {
        const statusColor = getStatusColor(pool.status)
        const timeRemaining = Math.max(0, pool.end_time - Math.floor(Date.now() / 1000))
        const hoursRemaining = Math.floor(timeRemaining / 3600)
        const minutesRemaining = Math.floor((timeRemaining % 3600) / 60)

        return (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/pools/${pool.id}`}
              className="group relative block rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                  {statusColor.label}
                </span>
              </div>

              {/* Pool Info */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <h3 className="font-bold text-foreground text-lg line-clamp-2 pr-20">{pool.name}</h3>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Pool ID</p>
                    <p className="font-mono text-sm font-semibold text-primary">{pool.pool_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Participants</p>
                    <p className="font-semibold text-sm">{pool.total_participants}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Vault</p>
                    <p className="font-mono text-sm font-semibold">{formatTokenAmount(pool.vault_balance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Time Left</p>
                    <p className="font-semibold text-sm">
                      {hoursRemaining}h {minutesRemaining}m
                    </p>
                  </div>
                </div>

                {/* Pool Properties */}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs space-y-2">
                    {pool.max_accuracy_buffer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy Buffer</span>
                        <span className="text-foreground font-mono">{pool.max_accuracy_buffer}</span>
                      </div>
                    )}
                    {pool.conviction_bonus_bps && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bonus (bps)</span>
                        <span className="text-foreground font-mono">{pool.conviction_bonus_bps}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-primary text-sm font-semibold">View Pool →</p>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
