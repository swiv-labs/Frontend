"use client"

import { PageLayout } from "@/components/layout/PageLayout"
import ActivePositions from "@/components/sections/profile/ActivePositions"
import BalanceCards from "@/components/sections/profile/BalanceCards"
import PerformanceMetrics from "@/components/sections/profile/PerformanceMetrics"
import PnLChart from "@/components/sections/profile/PnLChart"
import ProfileHeader from "@/components/sections/profile/ProfileHeader"
import RecentActivity from "@/components/sections/profile/RecentActivity"
import { useAppSelector } from "@/lib/store/hooks"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { authenticated } = usePrivy()
  const router = useRouter()
  const predictions = useAppSelector((state) => state.predictions.predictions)

  useEffect(() => {
    if (!authenticated) {
      router.push("/")
    }
  }, [authenticated, router])

  if (!authenticated) {
    return null
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-4 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <ProfileHeader />

          {/* Balance Cards */}
          <BalanceCards />

          {/* PnL Chart and Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PnLChart />
            </div>
            <div>
              <PerformanceMetrics />
            </div>
          </div>

          {/* Active Positions */}
          <ActivePositions />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </PageLayout>
  )
}
