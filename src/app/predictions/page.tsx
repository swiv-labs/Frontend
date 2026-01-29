"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { fetchUserPredictions } from "@/lib/api/predictions"
import { setPredictions, setLoading, setError } from "@/lib/store/slices/predictionsSlice"
import { PageLayout } from "@/components/layout/PageLayout"
import { PredictionsHeader } from "@/components/sections/predictions/PredictionsHeader"
import { PredictionsStats } from "@/components/sections/predictions/PredictionsStats"
import { PredictionsTable } from "@/components/sections/predictions/PredictionsTable"
import { LoadingSpinner } from "@/components/ui/LoadigSpinner"

export default function PredictionsPage() {
  const { isConnected, address } = useAppSelector((state) => state.wallet)
  const { predictions, stats, loading } = useAppSelector((state) => state.predictions)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isConnected && address) {
      dispatch(setLoading(true))
      fetchUserPredictions(address)
        .then((response) => {
          dispatch(
            setPredictions({
              predictions: response.predictions,
              stats: response.stats,
            }),
          )
        })
        .catch((error) => {
          console.error("Failed to fetch predictions:", error)
          dispatch(setError(error.message))
        })
    }
  }, [isConnected, address, dispatch])

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-full flex justify-center text-6xl mb-4">
              <Lock size={60} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view your predictions</p>
          </motion.div>
        </div>
      </PageLayout>
    )
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-4">
        <div className="mx-auto max-w-7xl">
          {/* <PredictionsHeader /> */}
          <PredictionsStats predictions={predictions} stats={stats} />
          <PredictionsTable predictions={predictions} />
        </div>
      </div>
    </PageLayout>
  )
}
