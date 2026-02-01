"use client"

import { PageLayout } from "@/components/layout/PageLayout"
import { PoolsFilters } from "@/components/sections/pools/PoolsFilter"
import { PoolsGrid } from "@/components/sections/pools/PoolsGrid"
import { LoadingScreen } from "@/components/ui/LoadigSpinner"
import { getAllPools } from "@/lib/api/pools"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setError, setLoading, setPools } from "@/lib/store/slices/poolsSlice"
import { useState, useEffect } from "react"
import type { PoolStatus } from "@/lib/types/models"

export default function PoolsPage() {
  const dispatch = useAppDispatch()
  const { pools, loading, error } = useAppSelector((state) => state.pools)
  const [filter, setFilter] = useState<PoolStatus | "active">("active")

  useEffect(() => {
    const loadPools = async () => {
      dispatch(setLoading(true))

      try {
        const status = (filter as PoolStatus)
        const apiPools = await getAllPools(status)
        dispatch(setPools(apiPools))
      } catch (err) {
        console.error("[pools] Error loading pools:", err)
        dispatch(setError("Failed to load pools. Please try again later."))
      } finally {
        dispatch(setLoading(false))
      }
    }

    loadPools()
  }, [dispatch, filter])

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
        <div>
          <PoolsFilters currentFilter={filter} onFilterChange={setFilter} />
          <PoolsGrid pools={pools} />
        </div>
      </div>
    </PageLayout>
  )
}
