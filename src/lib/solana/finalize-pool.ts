/**
 * Finalize pool weights flow
 * After pool resolution and weight calculations are complete and flushed back to L1,
 * call this function to finalize weights and allow users to claim rewards
 */

import { finalizePoolWeights } from "@/lib/api/pools"

/**
 * Finalize pool weights
 * This is an admin operation that:
 * 1. Calls finalize_weights instruction on-chain
 * 2. Updates pool state to "settled" (claimable)
 * 3. Transfers unclaimed pool fees to treasury
 */
export async function finalizePoolWeightsFlow(poolId: string): Promise<{
  success: boolean
  poolId: string
  status: string
}> {
  try {
    console.log(`[Finalize] 🔄 Starting finalize weights flow for pool ${poolId}...`)

    // Call backend to execute finalize_weights instruction
    console.log(`[Finalize] 📤 Calling finalize_weights instruction...`)
    const result = await finalizePoolWeights(poolId)

    console.log(`[Finalize] ✅ Pool finalized successfully`)
    console.log(`[Finalize]   Status: ${result.status}`)
    console.log(`[Finalize]   Weight Finalized: ${result.weight_finalized}`)

    return {
      success: true,
      poolId,
      status: result.status,
    }
  } catch (error) {
    console.error(`[Finalize] ❌ Finalize flow failed:`, error)
    throw error
  }
}
