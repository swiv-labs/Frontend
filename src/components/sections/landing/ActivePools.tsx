"use client"

import { getAllPools } from "@/lib/api/pools"
import { Pool } from "@/lib/store/slices/poolsSlice"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"

export function ActivePoolsSection() {
  const [activePools, setActivePools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivePools = async () => {
      try {
        const pools = await getAllPools("active")
        setActivePools(pools.slice(0, 3))
      } catch (error) {
        console.error("[v0] Error loading active pools:", error)
        // Fallback to empty array on error
        setActivePools([])
      } finally {
        setLoading(false)
      }
    }

    loadActivePools()
  }, [])

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  if (loading) {
    return (
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading active pools...</p>
          </div>
        </div>
      </section>
    )
  }

  if (activePools.length === 0) {
    return (
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Active Pools
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed mb-8">
              No active pools at the moment. Check back soon!
            </p>
            <Link
              href="/pools"
              className="inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-white bg-gradient-to-r from-primary to-accent rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/50"
            >
              View All Pools
            </Link>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">Active Pools</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Join live prediction pools and start earning rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {activePools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative"
            >
              {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" /> */}
              <div className="relative p-8 rounded-3xl bg-card/80 dark:bg-card/10 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-3xl shadow-lg">
                      {/* {pool.icon} */}
                    </div>
                    <div>
                      {/* <h3 className="font-bold text-lg text-foreground">{pool.asset}</h3> */}
                      {/* <p className="text-sm text-muted-foreground font-medium">{pool.symbol}</p> */}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-xs font-bold text-green-500 dark:text-green-400 shadow-lg shadow-green-500/10">
                    LIVE
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                    <span className="text-sm text-muted-foreground font-medium">Pool Size</span>
                    <span className="text-sm font-bold text-foreground">${pool.vault_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                    <span className="text-sm text-muted-foreground font-medium">Participants</span>
                    <span className="text-sm font-bold text-foreground">{pool.total_participants}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                    <span className="text-sm text-muted-foreground font-medium">Deadline</span>
                    {/* <span className="text-sm font-bold text-primary">{formatDeadline(pool.end_time)}</span> */}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/pools/${pool.id}`}
                  className="block w-full py-4 text-center text-sm font-bold text-white bg-gradient-to-r from-primary to-accent rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 hover:scale-105"
                >
                  Join Pool
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/pools"
            className="group inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-foreground rounded-2xl transition-all duration-300 border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl"
          >
            View All Pools
            <svg
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
