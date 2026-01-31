"use client"

import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Pool } from "@/lib/store/slices/poolsSlice"
import { TrendingUp } from "lucide-react"

interface PriceChartProps {
  pool: Pool
  historicalData: Array<{ timestamp: number; price: number }>
}

export function PriceChart({ pool, historicalData }: PriceChartProps) {
  const chartData = historicalData.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: item.price,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm text-muted-foreground mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-primary">${payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 rounded-2xl border border-border"
    >
      <div className="mb-6">
        <h2 className="text-base md:text-lg font-bold text-foreground mb-2">Price History</h2>
        <p className="text-xs md:text-sm text-muted-foreground">30-day price chart for asset in quote</p>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
            <XAxis dataKey="date" stroke="rgb(161, 161, 170)" style={{ fontSize: "12px" }} />
            <YAxis
              stroke="rgb(161, 161, 170)"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="rgb(139, 92, 246)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "rgb(139, 92, 246)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl w-full justify-center text-center flex mb-2"><TrendingUp/></div>
            <p className="text-muted-foreground text-xs md:text-sm">Price data not available</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
