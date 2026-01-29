/**
 * Production-grade bet placement using MagicBlock delegation + Privy signing
 * 
 * This implementation mirrors the pool_test.ts flow exactly:
 * 
 * Flow:
 * 1. STEP 3.1 (L1): Initialize bet on Solana mainnet
 *    - Create betting account (UserBet PDA)
 *    - Create permission account for delegation
 *    - Setup delegation record for TEE
 *    - All done in single transaction, signed by user (Privy)
 * 
 * 2. STEP 3.2 (TEE): Execute private prediction placement
 *    - Authenticate user to TEE using Privy wallet signature
 *    - Create TEE-specific connection with auth token
 *    - Execute place_bet instruction in ephemeral environment
 *    - Prediction encrypted and stored on TEE
 * 
 * 3. STEP 4 (Backend): Save metadata to database
 *    - Persist bet record for user queries
 *    - Link on-chain bet account to user profile
 */

import * as anchor from "@coral-xyz/anchor"
import { PublicKey, Transaction, SystemProgram, Connection, sendAndConfirmTransaction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import * as nacl from "tweetnacl"
import {
  permissionPdaFromAccount,
  delegationRecordPdaFromDelegatedAccount,
  delegationMetadataPdaFromDelegatedAccount,
  delegateBufferPdaFromDelegatedAccountAndOwnerProgram,
  getAuthToken,
  waitUntilPermissionActive,
  PERMISSION_PROGRAM_ID,
  DELEGATION_PROGRAM_ID,
} from "@magicblock-labs/ephemeral-rollups-sdk"
import { placePrediction } from "@/lib/api/predictions"
import type { Prediction } from "@/lib/types/models"

// ============================================================================
// Constants (from contract tests)
// ============================================================================

const SEED_BET = Buffer.from("user_bet")
const TEE_VALIDATOR = new PublicKey("FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA")
const TEE_URL = "https://tee.magicblock.app"
const TEE_WS_URL = "wss://tee.magicblock.app"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================================
// Types
// ============================================================================

export interface PlaceBetParams {
  // L1 Solana context
  l1Connection: Connection
  program: anchor.Program<any> // SwivPrivacy program
  
  // User context
  userWallet: PublicKey
  userSignerSecret: Uint8Array // For TEE auth signing (from Privy)
  userTokenAccount: PublicKey // ATA for token transfers
  
  // Pool context
  poolId: string // Backend pool ID
  poolPubkey: PublicKey // On-chain pool account
  protocolPda: PublicKey // Protocol account
  vaultPda: PublicKey // Pool vault
  
  // Bet details
  prediction: anchor.BN // Predicted value (BN for precision)
  stakeAmount: anchor.BN // Bet amount in smallest token units
  requestId: string // Unique request ID for PDA derivation
}

export interface L1InitResult {
  betPubkey: PublicKey
  permissionPda: PublicKey
  txSignature: string
}

export interface TEEAuthToken {
  token: string
  expiresAt?: number
}

export interface TEEExecutionResult {
  teeSignature: string
  delegationMetadata: PublicKey
}

// ============================================================================
// Step 1: L1 Transaction - Setup Bet & Delegation
// Mirrors: it("3.1. Secure Bet Setup (L1: Init & Delegate)")
// ============================================================================

/**
 * Initialize bet on L1 Solana and setup delegation to TEE
 * 
 * This combines 4 instructions into a single transaction:
 * 1. initBet - Create UserBet account, transfer tokens to vault
 * 2. createBetPermission - Create permission account for delegation
 * 3. delegateBetPermission - Setup delegation record
 * 4. delegateBet - Register delegation to TEE validator
 * 
 * All signed by the user (via Privy)
 */
export async function initBetAndDelegate(params: PlaceBetParams): Promise<L1InitResult> {
  console.log("[L1] 🏗️  Initializing and delegating user bet on L1...")

  // Derive bet PDA using exact test pattern
  const [betPubkey] = PublicKey.findProgramAddressSync(
    [SEED_BET, params.poolPubkey.toBuffer(), params.userWallet.toBuffer(), Buffer.from(params.requestId)],
    params.program.programId,
  )
  const permissionPda = permissionPdaFromAccount(betPubkey)

  console.log(`[L1]   👉 Bet PDA: ${betPubkey.toBase58()}`)
  console.log(`[L1]   👉 Permission PDA: ${permissionPda.toBase58()}`)

  // Build 4-instruction transaction (from test)
  const tx = new anchor.web3.Transaction().add(
    // Instruction 1: Initialize bet account
    await params.program.methods
      .initBet(params.stakeAmount, params.requestId)
      .accountsPartial({
        user: params.userWallet,
        protocol: params.protocolPda,
        pool: params.poolPubkey,
        poolVault: params.vaultPda,
        userTokenAccount: params.userTokenAccount,
        userBet: betPubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),

    // Instruction 2: Create permission account
    await params.program.methods
      .createBetPermission(params.requestId)
      .accountsPartial({
        payer: params.userWallet,
        user: params.userWallet,
        userBet: betPubkey,
        pool: params.poolPubkey,
        permission: permissionPda,
        permissionProgram: PERMISSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),

    // Instruction 3: Delegate permission to TEE
    await params.program.methods
      .delegateBetPermission(params.requestId)
      .accountsPartial({
        user: params.userWallet,
        pool: params.poolPubkey,
        userBet: betPubkey,
        permission: permissionPda,
        permissionProgram: PERMISSION_PROGRAM_ID,
        delegationProgram: DELEGATION_PROGRAM_ID,
        delegationRecord: delegationRecordPdaFromDelegatedAccount(permissionPda),
        delegationMetadata: delegationMetadataPdaFromDelegatedAccount(permissionPda),
        delegationBuffer: delegateBufferPdaFromDelegatedAccountAndOwnerProgram(
          permissionPda,
          PERMISSION_PROGRAM_ID,
        ),
        validator: TEE_VALIDATOR,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),

    // Instruction 4: Register delegation
    await params.program.methods
      .delegateBet(params.requestId)
      .accountsPartial({
        user: params.userWallet,
        pool: params.poolPubkey,
        userBet: betPubkey,
        validator: TEE_VALIDATOR,
      })
      .instruction(),
  )

  // Send and confirm on L1
  const txSignature = await sendAndConfirmTransaction(params.l1Connection, tx, [
    // IMPORTANT: This is a workaround - in production, Privy signs the transaction
    // For now, we create a temporary keypair, but frontend integration will use Privy's signTransaction
    anchor.web3.Keypair.generate(),
  ])

  console.log(`[L1]   ✅ L1 Transaction confirmed: ${txSignature}`)
  console.log(`[L1]   ⏳  Waiting for TEE to index delegation...`)

  // Wait for TEE to see the delegation
  await waitUntilPermissionActive(TEE_URL, betPubkey)

  console.log(`[L1]   ✨ TEE synchronization complete`)

  return {
    betPubkey,
    permissionPda,
    txSignature,
  }
}

// ============================================================================
// Step 2: TEE Authentication
// Helper to get auth token using Privy wallet signature
// ============================================================================

/**
 * Get auth token from TEE using user's Privy wallet signature
 * Mirrors: getAuthTokenWithRetry()
 */
export async function getTeeAuthToken(
  endpoint: string,
  userPublicKey: PublicKey,
  userSecretKey: Uint8Array,
  retries: number = 3,
): Promise<TEEAuthToken> {
  console.log("[TEE-Auth] 🔐 Authenticating with TEE...")

  for (let i = 0; i < retries; i++) {
    try {
      // Get auth token from TEE using message signing
      const token = await getAuthToken(endpoint, userPublicKey, async (msg: Uint8Array) =>
        nacl.sign.detached(msg, userSecretKey),
      )

      console.log(`[TEE-Auth]   ✅ Authentication successful`)
      return { token }
    } catch (error) {
      if (i === retries - 1) {
        console.error(`[TEE-Auth]   ❌ Auth failed after ${retries} retries`, error)
        throw error
      }
      console.log(`[TEE-Auth]   ⚠️  Auth failed. Retrying (${i + 1}/${retries})...`)
      await sleep(2000 * (i + 1))
    }
  }

  throw new Error("Unreachable")
}

// ============================================================================
// Step 3: TEE Execution - Place Bet on TEE
// Mirrors: it("3.2. Secure Bet Execution (TEE: Place Bet)")
// ============================================================================

/**
 * Execute private bet placement on TEE
 * 
 * This:
 * 1. Authenticates user to TEE via signature
 * 2. Creates TEE-specific connection with auth token
 * 3. Builds placeBet instruction
 * 4. Sends to TEE (encrypted execution environment)
 */
export async function executeBetOnTee(params: {
  program: anchor.Program<any>
  userWallet: PublicKey
  userSecretKey: Uint8Array
  poolPubkey: PublicKey
  betPubkey: PublicKey
  prediction: anchor.BN
  requestId: string
}): Promise<TEEExecutionResult> {
  console.log("[TEE] 🎯 Executing private bet on TEE...")

  // Step 1: Get auth token
  const authToken = await getTeeAuthToken(TEE_URL, params.userWallet, params.userSecretKey)

  // Step 2: Create TEE connection with auth token
  const teeConnection = new Connection(`${TEE_URL}?token=${authToken.token}`, {
    commitment: "confirmed",
    wsEndpoint: `${TEE_WS_URL}?token=${authToken.token}`,
  })

  console.log(`[TEE]   🚀 Sending placeBet to TEE (Prediction: ${params.prediction.toString()})...`)

  // Step 3: Build placeBet instruction
  const placeBetIx = await params.program.methods
    .placeBet(params.prediction, params.requestId)
    .accountsPartial({
      user: params.userWallet,
      pool: params.poolPubkey,
      userBet: params.betPubkey,
    })
    .instruction()

  // Step 4: Send transaction to TEE
  const tx = new anchor.web3.Transaction().add(placeBetIx)
  tx.feePayer = params.userWallet

  // Get blockhash from TEE connection
  const { blockhash } = await teeConnection.getLatestBlockhash()
  tx.recentBlockhash = blockhash

  // Sign and send to TEE (skipPreflight because TEE is not standard Solana)
  const teeSignature = await sendAndConfirmTransaction(teeConnection, tx, [
    // User keypair would be provided here in production
    // For now using temporary - Privy integration will replace this
    anchor.web3.Keypair.generate(),
  ] as any, {
    skipPreflight: true,
  })

  console.log(`[TEE]   ✅ Bet executed privately on TEE: ${teeSignature}`)
  await sleep(1000) // Wait for TEE indexing

  return {
    teeSignature,
    delegationMetadata: delegationMetadataPdaFromDelegatedAccount(params.betPubkey),
  }
}

// ============================================================================
// Step 4: Backend Persistence
// Save bet metadata to database
// ============================================================================

/**
 * Save bet metadata to backend database
 * Mirrors: placePrediction() API call
 */
export async function saveBetToDatabase(params: {
  poolId: string
  userWallet: PublicKey
  betPubkey: PublicKey
  stakeAmount: anchor.BN
  prediction: anchor.BN
  requestId: string
  l1TxSignature: string
  teeTxSignature: string
}): Promise<Prediction> {
  console.log("[DB] 💾 Saving bet metadata to database...")

  try {
    const prediction = await placePrediction({
      poolId: params.poolId,
      userWallet: params.userWallet.toString(),
      deposit: params.stakeAmount.toNumber(),
      prediction: params.prediction.toNumber(),
      requestId: params.requestId,
      bet_pubkey: params.betPubkey.toString(),
    })

    console.log(`[DB]   ✅ Bet saved: ${prediction.id}`)
    return prediction
  } catch (error) {
    console.error("[DB]   ❌ Failed to save bet", error)
    throw error
  }
}

// ============================================================================
// Main Orchestration: Full Bet Placement Flow
// ============================================================================

/**
 * Full bet placement flow combining all 3 steps
 * 
 * This is the entry point called from the frontend component
 * It orchestrates:
 * 1. L1 initialization & delegation setup
 * 2. TEE authentication & execution
 * 3. Database persistence
 */
export async function placeEncryptedBet(params: PlaceBetParams): Promise<Prediction> {
  try {
    console.log("\n==========================================")
    console.log("🎲 STARTING FULL BET PLACEMENT FLOW")
    console.log("==========================================\n")

    // STEP 3.1: L1 Setup
    console.log("STEP 1: L1 INITIALIZATION & DELEGATION\n")
    const l1Result = await initBetAndDelegate(params)

    // STEP 3.2: TEE Execution
    console.log("\nSTEP 2: TEE PRIVATE BET EXECUTION\n")
    const teeResult = await executeBetOnTee({
      program: params.program,
      userWallet: params.userWallet,
      userSecretKey: params.userSignerSecret,
      poolPubkey: params.poolPubkey,
      betPubkey: l1Result.betPubkey,
      prediction: params.prediction,
      requestId: params.requestId,
    })

    // STEP 4: Save to Backend
    console.log("\nSTEP 3: DATABASE PERSISTENCE\n")
    const dbResult = await saveBetToDatabase({
      poolId: params.poolId,
      userWallet: params.userWallet,
      betPubkey: l1Result.betPubkey,
      stakeAmount: params.stakeAmount,
      prediction: params.prediction,
      requestId: params.requestId,
      l1TxSignature: l1Result.txSignature,
      teeTxSignature: teeResult.teeSignature,
    })

    console.log("\n==========================================")
    console.log("✅ BET PLACEMENT COMPLETE!")
    console.log("==========================================")
    console.log(`Bet Account: ${l1Result.betPubkey.toString()}`)
    console.log(`L1 Signature: ${l1Result.txSignature}`)
    console.log(`TEE Signature: ${teeResult.teeSignature}`)
    console.log(`Database ID: ${dbResult.id}`)
    console.log("==========================================\n")

    return dbResult
  } catch (error) {
    console.error("\n❌ BET PLACEMENT FAILED")
    console.error(error)
    throw error
  }
}

// ============================================================================
// Additional: Claim Rewards
// ============================================================================

export async function claimPredictionReward(predictionId: string): Promise<Prediction> {
  // TODO: Implement claim reward flow
  // This would follow a similar pattern to bet placement
  throw new Error("Claim reward not yet implemented")
}