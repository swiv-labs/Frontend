"use client"

import type { Pool } from "@/lib/types/models"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              className="group relative block rounded-xl border border-border/50 bg-muted/30 p-3 transition-all hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10"
            >
              {/* Status Badge */}
              <div className="absolute top-2 right-4">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold ${statusColor.bg} ${statusColor.text}`}>
                  {statusColor.label}
                </span>
              </div>

              {/* Pool Info */}
              <div className="flex gap-2 w-full">
                <div className="w-2/5">
                  <Image className="w-[256px] h-[130px] object-cover rounded-lg" src={pool.metadata ? pool.metadata : "https://bernardmarr.com/wp-content/uploads/2025/01/bitcoin.jpg"} alt={"pool image"} width={200} height={200} />
                </div>
                <div className="w-3/5 flex flex-col space-y-2">
                  {/* Name */}
                  <div>
                    <h3 className="font-bold text-foreground text-base line-clamp-2 pr-20">{pool.name}</h3>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Pool ID</p>
                      <p className="font-mono text-xs font-semibold text-primary">{pool.pool_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Participants</p>
                      <p className="font-semibold text-xs">{pool.total_participants}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Pool Volume</p>
                      <p className="font-mono text-xs font-semibold">${formatTokenAmount(pool.vault_balance)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">Time Left</p>
                      <p className="font-semibold text-xs">
                        {hoursRemaining}h {minutesRemaining}m
                      </p>
                    </div>
                  </div>

                  {/* Pool Properties */}
                  {/* <div className="pt-2 border-t border-border">
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
                </div> */}

                  {/* Hover CTA */}
                  {/* <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-primary text-sm font-semibold">View Pool →</p>
                  </div> */}
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
