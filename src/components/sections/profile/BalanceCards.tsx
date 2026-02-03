"use client"

import { motion } from "framer-motion"
import { useAppSelector } from "@/lib/store/hooks"
import { Briefcase, ChartBarIncreasing, DollarSign, Gift, Lock } from "lucide-react"
import { formatUsdcBalanceWithDollar, formatUsdcBalanceWithSign } from "@/lib/helpers/formatUsdc"

export default function BalanceCards() {
  const balance = useAppSelector((state) => state.wallet.balance)
  const predictions = useAppSelector((state) => state.predictions.predictions)

  // Calculate balances
  const activePredictions = predictions.filter((p) => p.status === "active" || p.status === "calculated")
  const stakedBalance = activePredictions.reduce((sum, p) => sum + p.deposit, 0)

  const completedPredictions = predictions.filter((p) => p.status === "claimed")
  const claimableBalance = completedPredictions.reduce((sum, p) => sum + (p.reward || 0), 0)

  const totalPnL = completedPredictions.reduce((sum, p) => {
    const pnl = (p.reward || 0) - p.deposit
    return sum + pnl
  }, 0)

  const portfolioValue = balance + stakedBalance + claimableBalance

  const cards = [
    {
      title: "Portfolio Value",
      value: portfolioValue,
      icon: <Briefcase/>,
      color: "from-violet-500 to-purple-600",
      textColor: "text-gray-800 dark:text-gray-200",
    },
    {
      title: "Cash Balance",
      value: balance,
      icon: <DollarSign/>,
      color: "from-violet-500 to-purple-600",
      textColor: "text-gray-800 dark:text-gray-200",
    },
    {
      title: "Staked",
      value: stakedBalance,
      icon: <Lock/>,
      color: "from-violet-500 to-purple-600",
      textColor: "text-gray-800 dark:text-gray-200",
    },
    {
      title: "Claimable",
      value: claimableBalance,
      icon: <Gift/>,
      color: "from-violet-500 to-purple-600",
      textColor: "text-gray-800 dark:text-gray-200",
    },
    {
      title: "Total PnL",
      value: totalPnL,
      icon: totalPnL >= 0 ? <ChartBarIncreasing/> : <ChartBarIncreasing/>,
      color: "from-violet-500 to-purple-600",
      textColor: totalPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      showSign: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl p-6 border border-gray-100 dark:border-gray-900 hover:shadow-lg hover:shadow-violet-500/10 dark:hover:shadow-violet-500/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-gray-200 flex items-center justify-center text-2xl`}
            >
              {card.icon}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{card.title}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>
            {card.showSign 
              ? formatUsdcBalanceWithSign(card.value)
              : formatUsdcBalanceWithDollar(card.value)
            }
          </p>
        </motion.div>
      ))}
    </div>
  )
}
