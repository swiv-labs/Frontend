"use client"

import { motion } from "framer-motion"
import { useAppSelector } from "@/lib/store/hooks"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PnLChart() {
  const predictions = useAppSelector((state) => state.predictions.predictions)

  // Generate cumulative PnL data
  const completedPredictions = predictions
    .filter((p) => p.status === "claimed")
    .sort((a, b) => new Date(a.pools.created_at!).getTime() - new Date(b.pools.created_at!).getTime())

  let cumulativePnL = 0
  const chartData = completedPredictions.map((pred) => {
    const pnl = (pred.reward || 0) - pred.deposit
    cumulativePnL += pnl
    return {
      date: new Date(pred.pools.created_at!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      pnl: cumulativePnL,
    }
  })

  // Add initial point
  if (chartData.length > 0) {
    chartData.unshift({ date: "Start", pnl: 0 })
  }

  const totalPnL = cumulativePnL
  const isPositive = totalPnL >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl p-6 border border-gray-100 dark:border-gray-900"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profit & Loss</h2>
          <p
            className={`text-3xl font-bold ${
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}${totalPnL.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-medium">
            All Time
          </button>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "PnL"]}
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke={isPositive ? "#10B981" : "#EF4444"}
              strokeWidth={3}
              dot={{ fill: isPositive ? "#10B981" : "#EF4444", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          No completed predictions yet
        </div>
      )}
    </motion.div>
  )
}
