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
          className="group relative rounded-xl border border-white/10 bg-[#0B0E11] p-5 transition-all hover:border-primary/40"
        >
          {/* Status */}
          <div className="absolute right-4 top-4 text-xs flex items-center gap-2">
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

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden">
              {typeof pool.icon === "string" ? (
                <img src={pool.icon} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">{pool.icon}</span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold leading-snug">
                {pool.asset}
              </h3>
              <p className="text-xs text-muted-foreground">
                Market Size
                <span className="ml-2 text-primary font-medium">
                  {pool.poolSize} SOL
                </span>
              </p>
            </div>
          </div>

          {/* Options */}
          {/* <div className="space-y-3">
            {pool.options?.map((opt) => (
              <div key={opt.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{opt.label}</span>
                  <span className="text-muted-foreground">
                    {opt.percentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-primary-400"
                    style={{ width: `${opt.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div> */}
        </Link>
      ))}
    </div>
  )
}
