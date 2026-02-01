"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PageLayout } from "@/components/layout/PageLayout"
import { PoolDetailsHeader } from "@/components/sections/pools-details/PoolDetilasHeader"
import { PoolStats } from "@/components/sections/pools-details/PoolStats"
import { PriceChart } from "@/components/sections/pools-details/PriceChart"
import { LoadingScreen } from "@/components/ui/LoadigSpinner"
import { fetchHistoricalPrices } from "@/lib/api/coingecko"
import { getPoolById } from "@/lib/api/pools"
import { useAppDispatch } from "@/lib/store/hooks"
import { setCurrentPool } from "@/lib/store/slices/poolsSlice"
import { extractCryptoSymbol } from "@/lib/helpers/extractCryptoSymbol"
import Link from "next/link"
import type { Pool } from "@/lib/types/models"
import { InlineBettingPanel } from "@/components/sections/pools-details/InlineBettingPanel"

export default function PoolDetailsPage() {
  const params = useParams()
  const dispatch = useAppDispatch()
  const [pool, setPool] = useState<Pool | null>(null)
  const [historicalData, setHistoricalData] = useState<Array<{ timestamp: number; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPoolData = async () => {
      try {
        const poolData = await getPoolById(params.id as string)
        setPool(poolData)
        dispatch(setCurrentPool(poolData))

        // Extract crypto symbol from pool name and fetch historical prices
        const coinId = extractCryptoSymbol(poolData.name)
        if (coinId) {
          console.log(`[pools-details] Found crypto symbol: ${coinId} from pool name: ${poolData.name}`)
          const priceData = await fetchHistoricalPrices(coinId, 30)
          setHistoricalData(priceData)
        } else {
          console.log(`[pools-details] Could not extract crypto symbol from pool name: ${poolData.name}`)
        }
      } catch (err) {
        console.error("[pools-details] Error loading pool:", err)
        setError("Failed to load pool details")
      } finally {
        setLoading(false)
      }
    }

    loadPoolData()
  }, [params.id, dispatch])

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !pool) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-4">?</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pool not found</h2>
            <p className="text-muted-foreground mb-6">{error || "The pool you're looking for doesn't exist"}</p>
            <Link
              href="/pools"
              className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-smooth"
            >
              Back to Pools
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-4">
        <div className="mx-auto max-w-7xl">
          <PoolDetailsHeader pool={pool} />

          {/* Main Layout: Chart on left, Betting Panel on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left side: Pool info and chart */}
            <div className="lg:col-span-2 space-y-6">
              <PriceChart pool={pool} historicalData={historicalData} />
              <PoolStats pool={pool} />
            </div>

            {/* Right side: Inline betting panel */}
            <div>
              <InlineBettingPanel pool={pool} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
