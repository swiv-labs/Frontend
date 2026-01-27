"use client"

import { Pool } from "@/lib/store/slices/poolsSlice"
import Link from "next/link"

interface PoolsGridProps {
  pools: Pool[]
}

export function PoolsGrid({ pools }: PoolsGridProps) {
  if (pools.length === 0) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        No markets found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pools.map((pool) => (
        <Link
          key={pool.id}
          href={`/pools/${pool.id}`}
          className="group relative rounded-xl border border-foreground/10 bg-background/90 p-5 transition-all hover:border-primary/40"
        >

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1/5 rounded-lg bg-background/40 flex items-center justify-center overflow-hidden">
              {typeof pool.icon === "string" ? (
                <img src={"https://storage.trepa.app/76a5077a-b392-4af2-b226-36efaea2a65e.webp"} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">{pool.icon}</span>
              )}
            </div>

            <div className="w-4/5">
              <div className="flex mb-2">
                <h3 className="text-sm font-semibold leading-snug">
                  Bitcoin Price at 11:59 PM UTC on January 27, 2026
                </h3>
                <div className="text-xs flex items-center gap-2">
                  {pool.status === "ongoing" && (
                    <>
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-red-400">Live</span>
                    </>
                  )}

                  {pool.status === "ongoing" && (
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-400">
                      Pending
                    </span>
                  )}

                  {pool.status === "closed" && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Market Size
                <span className="ml-2 text-primary font-medium">
                  {pool.poolSize} SOL
                </span>
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
