"use client"

import { PageLayout } from "@/components/layout/PageLayout"
import { LeaderboardHeader } from "@/components/sections/leaderboard/LeaderboardHeader"
import { LeaderboardTable } from "@/components/sections/leaderboard/LeaderboardTable"
import { mockLeaderboard } from "@/lib/data/mockData"



export default function LeaderboardPage() {
  return (
    <PageLayout>
      <div className="min-h-screen py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* <LeaderboardHeader /> */}
          <LeaderboardTable entries={mockLeaderboard} />
        </div>
      </div>
    </PageLayout>
  )
}
