"use client"

import { PageLayout } from "@/components/layout/PageLayout"
import { PoolsFilters } from "@/components/sections/pools/PoolsFilter"
import { PoolsGrid } from "@/components/sections/pools/PoolsGrid"
import { LoadingScreen } from "@/components/ui/LoadigSpinner"
import { fetchCryptoPrice } from "@/lib/api/coingecko"
import { getAllPools } from "@/lib/api/pools"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setError, setLoading, setPools, updatePoolPrice } from "@/lib/store/slices/poolsSlice"
import { useState, useEffect } from "react"

export default function PoolsPage() {
  const dispatch = useAppDispatch()
  const { pools, loading, error } = useAppSelector((state) => state.pools)
  const [filter, setFilter] = useState<"all" | "ongoing" | "upcoming" | "closed">("all")

  useEffect(() => {
    const loadPools = async () => {
      dispatch(setLoading(true))

      try {
        const apiPools = await getAllPools()
        dispatch(setPools(apiPools))

        const uniqueSymbols = [...new Set(apiPools.map((pool) => pool.symbol))]
        const symbolToCoinGeckoId: Record<string, string> = {
          BTC: "bitcoin",
          ETH: "ethereum",
          SOL: "solana",
          ADA: "cardano",
          DOT: "polkadot",
          AVAX: "avalanche",
        }

        for (const symbol of uniqueSymbols) {
          const coinGeckoId = symbolToCoinGeckoId[symbol]
          if (coinGeckoId) {
            const price = await fetchCryptoPrice(coinGeckoId)
            if (price) {
              // Update all pools with this symbol
              apiPools.forEach((pool) => {
                if (pool.symbol === symbol) {
                  dispatch(updatePoolPrice({ id: pool.id, price }))
                }
              })
            }
          }
        }
      } catch (err) {
        console.error("[v0] Error loading pools:", err)
        dispatch(setError("Failed to load pools. Please try again later."))
      } finally {
        dispatch(setLoading(false))
      }
    }

    loadPools()
  }, [dispatch])

  const filteredPools = filter === "all" ? pools : pools.filter((pool) => pool.status === filter)

  if (loading && pools.length === 0) {
    return <LoadingScreen />
  }

  if (error && pools.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">!</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Failed to load pools</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-smooth"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-2">
        <div className="">
          <PoolsFilters currentFilter={filter} onFilterChange={setFilter} />
          <PoolsGrid pools={filteredPools} />
        </div>
      </div>
    </PageLayout>
  )
}
