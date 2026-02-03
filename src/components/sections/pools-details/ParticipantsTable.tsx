"use client"

import { motion } from "framer-motion"
import { formatUsdcBalanceWithDollar } from "@/lib/helpers/formatUsdc"

interface ParticipantsTableProps {
  poolId: string
}

const mockParticipants = [
  { address: "0x742d...3f8a", prediction: 105000, stake: 1000, timestamp: "2h ago" },
  { address: "0x9a3c...7b2e", prediction: 103500, stake: 750, timestamp: "5h ago" },
  { address: "0x1f5d...4c9b", prediction: 107200, stake: 1500, timestamp: "8h ago" },
  { address: "0x8e2a...6d1f", prediction: 102800, stake: 500, timestamp: "12h ago" },
  { address: "0x3b7f...9e4c", prediction: 106500, stake: 2000, timestamp: "1d ago" },
]

export function ParticipantsTable({ poolId }: ParticipantsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 rounded-2xl border border-border"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Recent Predictions</h2>
        <p className="text-sm text-muted-foreground">Latest predictions from participants</p>
      </div>



      <div className="text-center text-sm mt-10">Coming soon.</div>
      {/* <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Address</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Prediction</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Stake</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            {mockParticipants.map((participant, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-smooth"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-foreground">{participant.address}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sm font-semibold text-primary">
                    *******
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-foreground">{formatUsdcBalanceWithDollar(participant.stake)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{participant.timestamp}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </motion.div>
  )
}
