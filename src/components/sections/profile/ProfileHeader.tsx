"use client"

import { motion } from "framer-motion"
import { usePrivy } from "@privy-io/react-auth"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { useState } from "react"
import { updateProfile } from "@/lib/store/slices/walletSlice"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/lib/hooks/useToast"
import Image from "next/image"
import { formatUsdcBalanceWithDollar } from "@/lib/helpers/formatUsdc"

export default function ProfileHeader() {
  const { user } = usePrivy()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const wallet = useAppSelector((state) => state.wallet)
  const predictions = useAppSelector((state) => state.predictions.predictions)

  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(wallet.username || "")
  const [editAvatarUrl, setEditAvatarUrl] = useState(wallet.avatarUrl || "")
  const [isSaving, setIsSaving] = useState(false)

  const walletAddress = wallet.address || ""
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ""

  // Calculate total rewards
  const totalRewards = predictions.filter((p) => p.status === "claimed").reduce((sum, p) => sum + (p.reward || 0), 0)

  const handleSaveProfile = async () => {
    if (!walletAddress) return

    setIsSaving(true)
    try {
      const response = await authApi.updateProfile(walletAddress, {
        username: editUsername || undefined,
        avatarUrl: editAvatarUrl || undefined,
      })

      dispatch(
        updateProfile({
          username: response.data.username,
          avatarUrl: response.data.avatarUrl,
        }),
      )

      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {wallet.avatarUrl ? (
              <Image
                src={wallet.avatarUrl || "/placeholder.svg"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-violet-500"
                width={100}
                height={100}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {(wallet.username || shortAddress).slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {/* <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="Avatar URL (optional)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                /> */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditUsername(wallet.username || "")
                      setEditAvatarUrl(wallet.avatarUrl || "")
                    }}
                    className="px-4 py-2 border border-border text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {wallet.username || "My Portfolio"}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Edit profile"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{shortAddress}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress)
                      toast.success("Address copied!")
                    }}
                    className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {wallet.email && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{wallet.email}</span>
                    {wallet.isEmailVerified && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {!isEditing && (
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{predictions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Rewards</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatUsdcBalanceWithDollar(totalRewards)}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
