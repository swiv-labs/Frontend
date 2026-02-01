"use client"

import { motion } from "framer-motion"
import type { Pool } from "@/lib/types/models"
import { useEffect, useState } from "react"

interface PoolStatsProps {
  pool: Pool
}

/**
 * Pool statistics panel
 * Displays key pool metrics from the contract and database
 */
export function PoolStats({ pool }: PoolStatsProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateCountdown = () => {
      const endTime = pool.end_time * 1000 // Convert to milliseconds
      const now = Date.now()
      const diff = endTime - now

      if (diff <= 0) {
        setTimeLeft("Ended")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [pool.end_time])

  const stats = [
    {
      label: "Vault Balance",
      value: `${(pool.vault_balance / 1_000_000).toFixed(2)}`,
      unit: "USDC",
    },
    {
      label: "Total Participants",
      value: pool.total_participants.toLocaleString(),
    },
    {
      label: "Accuracy Buffer",
      value: pool.max_accuracy_buffer || "N/A",
    },
    {
      label: "Conviction Bonus",
      value: `${pool.conviction_bonus_bps} bps`,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className="text-base md:text-lg font-bold text-foreground mb-4">Pool Details</h2>

      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * (index + 1) }}
          className="p-4 rounded-xl border border-border hover:border-primary/50 transition-smooth"
        >
          <div className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</div>
          <div className="text-base md:text-lg font-bold text-foreground font-mono">
            {stat.value} {stat.unit && <span className="text-xs md:text-sm text-muted-foreground ml-1">{stat.unit}</span>}
          </div>
        </motion.div>
      ))}

      {/* Countdown */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="text-xs md:text-sm text-muted-foreground mb-1">Time Remaining</div>
        <div className="text-base md:text-xl font-bold text-primary font-mono">{timeLeft}</div>
      </div>

      {/* End Time */}
      <div className="p-4 rounded-xl border border-border">
        <div className="text-xs md:text-sm text-muted-foreground mb-1">Pool Ends At</div>
        <div className="text-xs md:text-base font-semibold text-foreground">
          {new Date(pool.end_time * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          })}
        </div>
      </div>

      {/* Pool Status */}
      {/* {pool.is_resolved && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="text-xs md:text-sm text-green-600 mb-1">Status</div>
          <div className="text-sm md:text-base font-semibold text-green-600">Pool Resolved</div>
          {pool.resolution_ts && (
            <div className="text-[10px] md:text-xs text-green-600/70 mt-2">
              Resolved at: {new Date(pool.resolution_ts * 1000).toLocaleString()}
            </div>
          )}
        </div>
      )} */}

      {/* On-chain Info */}
      <div className="p-3 rounded-lg bg-muted/50 text-[10px] text-xs space-y-2">
        <div className="font-mono text-muted-foreground">
          <span className="font-semibold">Pool Pubkey:</span>
          <div className="truncate text-primary mt-1">{pool.pool_pubkey}</div>
        </div>
        <div className="font-mono text-muted-foreground">
          <span className="font-semibold">Vault Pubkey:</span>
          <div className="truncate text-primary mt-1">{pool.vault_pubkey}</div>
        </div>
      </div>
    </motion.div>
  )
}
