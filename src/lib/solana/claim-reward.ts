import { PublicKey, SystemProgram, Connection, Transaction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor"
import { SwivPrivacy } from "../types/idl"
import IDL from "@/lib/idl/idl.json"
import { claimRewardDB } from "@/lib/api/predictions"

export const SEED_BET = Buffer.from("user_bet");
export const SEED_POOL = Buffer.from("pool");
export const SEED_POOL_VAULT = Buffer.from("pool_vault");
export const SEED_PROTOCOL = Buffer.from("protocol_v2");

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
  "confirmed",
)

export interface ClaimRewardParams {
  userWallet: PublicKey
  userTokenAccount: PublicKey
  poolId: number
  poolPubkey: PublicKey
  betPubkey: PublicKey
  signTransaction: (args: any) => Promise<Transaction>
  signMessage: (args: any) => Promise<Uint8Array>
  wallet: any
}

export async function buildAndSignClaimRewardTx(
  params: ClaimRewardParams
): Promise<{ signedTx: Transaction; txSignature: string }> {
  const provider = new AnchorProvider(
    connection,
    params.wallet as any,
    AnchorProvider.defaultOptions(),
  )
  const program = new Program(IDL as any, provider) as Program<SwivPrivacy>;

  console.log("[Claim] 🏗️  Building claim_reward transaction...", params)

  const [protocolPda] = PublicKey.findProgramAddressSync(
    [SEED_PROTOCOL],
    program.programId,
  );

  const [poolVaultPda] = PublicKey.findProgramAddressSync(
    [SEED_POOL_VAULT, params.poolPubkey.toBuffer()],
    program.programId,
  );

  console.log(`[Claim]   👉 User Wallet: ${params.userWallet.toBase58()}`)
  console.log(`[Claim]   👉 Bet PDA: ${params.betPubkey.toBase58()}`)
  console.log(`[Claim]   👉 Pool: ${params.poolPubkey.toBase58()}`)

  // Build claim_reward instruction
  const tx = new Transaction().add(
    await program.methods
      .claimReward()
      .accountsPartial({
        user: params.userWallet,
        pool: params.poolPubkey,
        poolVault: poolVaultPda,
        userBet: params.betPubkey,
        userTokenAccount: params.userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction(),
  );

  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = params.userWallet

  console.log("[Claim] 🔏 Signing transaction with user wallet...")
  const signedTx = await params.signTransaction({
    transaction: tx,
    connection
  });

  console.log("[Claim] 🚀 Broadcasting transaction...")
  const txSignature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  console.log("[Claim] ⏳ Confirming transaction...")
  await connection.confirmTransaction(txSignature, "confirmed")

  console.log(`[Claim] ✅ Claim transaction confirmed: ${txSignature}`)

  return {
    signedTx,
    txSignature,
  }
}

export async function claimRewardFlow(
  params: ClaimRewardParams & { predictionId: string }
): Promise<{
  txSignature: string
  reward: number
}> {
  try {
    console.log("[Claim] Starting complete claim reward flow...")

    const { txSignature } = await buildAndSignClaimRewardTx(params)

    const confirmedTx = await connection.getParsedTransaction(txSignature, 'confirmed')
    if (!confirmedTx || !confirmedTx.meta) {
      throw new Error('Failed to parse confirmed claim transaction')
    }

    let rewardAmount = 0
    const postBalances = confirmedTx.meta.postTokenBalances || []
    const preBalances = confirmedTx.meta.preTokenBalances || []

    for (const post of postBalances) {
      const pre = preBalances.find((p: any) => p.accountIndex === post.accountIndex)
      const preAmount = pre ? BigInt(pre.uiTokenAmount.amount) : BigInt(0)
      const postAmount = BigInt(post.uiTokenAmount.amount)

      if (postAmount > preAmount) {
        rewardAmount = Number(postAmount - preAmount)
        break
      }
    }

    console.log(`[Claim] 💰 Reward amount detected: ${rewardAmount}`)

    console.log("[Claim] 💾 Persisting claim record in backend...")
    const response = await claimRewardDB({
      predictionId: params.predictionId,
      userWallet: params.userWallet.toBase58(),
      claimTxSignature: txSignature,
      rewardAmount,
    })

    console.log("[Claim] ✨ Claim reward flow complete: ", response)

    return {
      txSignature,
      reward: rewardAmount,
    }
  } catch (error) {
    console.error("[Claim] ❌ Claim reward flow failed:", error)
    throw error
  }
}
