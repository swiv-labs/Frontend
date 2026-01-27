"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PageLayout } from "@/components/layout/PageLayout"
import { ParticipantsTable } from "@/components/sections/pools-details/ParticipantsTable"
import { PoolDetailsHeader } from "@/components/sections/pools-details/PoolDetilasHeader"
import { PoolStats } from "@/components/sections/pools-details/PoolStats"
import { PredictionModal } from "@/components/sections/pools-details/PredictionModal"
import { PriceChart } from "@/components/sections/pools-details/PriceChart"
import { LoadingScreen } from "@/components/ui/LoadigSpinner"
import { fetchHistoricalPrices } from "@/lib/api/coingecko"
import { Pool } from "@/lib/store/slices/poolsSlice"
import { getPoolById } from "@/lib/api/pools"
import Link from "next/link"

export default function PoolDetailsPage() {
  const params = useParams()
  const [pool, setPool] = useState<Pool | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [historicalData, setHistoricalData] = useState<Array<{ timestamp: number; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPoolData = async () => {
      try {
        const poolData = await getPoolById(params.id as string)
        setPool(poolData)

        const symbolToCoinGeckoId: Record<string, string> = {
          BTC: "bitcoin",
          ETH: "ethereum",
          SOL: "solana",
          ADA: "cardano",
          DOT: "polkadot",
          AVAX: "avalanche",
        }

        const coinGeckoId = symbolToCoinGeckoId[poolData.symbol]
        if (coinGeckoId) {
          const data = await fetchHistoricalPrices(coinGeckoId, 30)
          setHistoricalData(data)
        }
      } catch (err) {
        console.error("[v0] Error loading pool:", err)
        setError("Failed to load pool details")
      } finally {
        setLoading(false)
      }
    }

    loadPoolData()
  }, [params.id])

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
          <PoolDetailsHeader pool={pool} onPredict={() => setShowModal(true)} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PriceChart pool={pool} historicalData={historicalData} />
            </div>
            <div>
              <PoolStats pool={pool} />
            </div>
          </div>

          <ParticipantsTable poolId={pool.id} />
        </div>
      </div>

      {showModal && <PredictionModal pool={pool} onClose={() => setShowModal(false)} />}
    </PageLayout>
  )
}
