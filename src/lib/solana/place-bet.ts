import { PublicKey, SystemProgram, Connection, Transaction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
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
import { AnchorProvider, BN, Program, setProvider, web3 } from "@coral-xyz/anchor"
import { SwivPrivacy } from "../types/idl"
import IDL from "@/lib/idl/idl.json"

export const SEED_BET = Buffer.from("user_bet");
export const SEED_POOL = Buffer.from("pool");
export const SEED_POOL_VAULT = Buffer.from("pool_vault");
export const SEED_PROTOCOL = Buffer.from("protocol_v2");
const TEE_VALIDATOR = new PublicKey("FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA")
const TEE_URL = "https://tee.magicblock.app"
const TEE_WS_URL = "wss://tee.magicblock.app"

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
  "confirmed",
)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface PlaceBetParams {
  userWallet: PublicKey
  userTokenAccount: PublicKey
  poolId: string
  poolPubkey: PublicKey
  prediction: BN
  stakeAmount: BN
  requestId: string
  signTransaction: (args: any) => Promise<Transaction>
  signMessage: (args: any) => Promise<Uint8Array>
  wallet: any
}

export interface L1InitResult {
  betPda: PublicKey
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


export async function initBetAndDelegate(params: PlaceBetParams): Promise<L1InitResult> {
  const provider = new AnchorProvider(
    connection,
    params.wallet as any,
    AnchorProvider.defaultOptions(),
  )
  const program = new Program(IDL as any, provider) as Program<SwivPrivacy>;
  console.log("[L1] 🏗️  Initializing and delegating user bet on L1...", params)

  const [protocolPda] = PublicKey.findProgramAddressSync(
    [SEED_PROTOCOL],
    program.programId,
  );

  const [poolPda] = PublicKey.findProgramAddressSync(
    [SEED_POOL, new PublicKey("7CaD6cJQEZ1KVfRkhgunCpQgaMgpUENzbHT3qFRsqm1j").toBuffer(), new BN(params.poolId).toArrayLike(Buffer, "le", 8)],
    program.programId,
  )

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [SEED_POOL_VAULT, poolPda.toBuffer()],
    program.programId,
  );

  const [betPda] = PublicKey.findProgramAddressSync(
    [SEED_BET, poolPda.toBuffer(), params.userWallet.toBuffer(), Buffer.from(params.requestId),],
    program.programId,
  )

  const permissionPda = permissionPdaFromAccount(betPda)

  console.log(`[L1]   👉 Bet PDA: ${betPda.toBase58()}`)
  console.log(`[L1]   👉 Permission PDA: ${permissionPda.toBase58()}`)

  const tx = new web3.Transaction().add(
    await program.methods
      .initBet(params.stakeAmount, params.requestId)
      .accountsPartial({
        user: params.userWallet,
        protocol: protocolPda,
        pool: poolPda,
        poolVault: vaultPda,
        userTokenAccount: params.userTokenAccount,
        userBet: betPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
    await program.methods
      .createBetPermission(params.requestId)
      .accountsPartial({
        payer: params.userWallet,
        user: params.userWallet,
        userBet: betPda,
        pool: poolPda,
        permission: permissionPda,
        permissionProgram: PERMISSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
    await program.methods
      .delegateBetPermission(params.requestId)
      .accountsPartial({
        user: params.userWallet,
        pool: poolPda,
        userBet: betPda,
        permission: permissionPda,
        permissionProgram: PERMISSION_PROGRAM_ID,
        delegationProgram: DELEGATION_PROGRAM_ID,
        delegationRecord:
          delegationRecordPdaFromDelegatedAccount(permissionPda),
        delegationMetadata:
          delegationMetadataPdaFromDelegatedAccount(permissionPda),
        delegationBuffer:
          delegateBufferPdaFromDelegatedAccountAndOwnerProgram(
            permissionPda,
            PERMISSION_PROGRAM_ID,
          ),
        validator: TEE_VALIDATOR,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
    await program.methods
      .delegateBet(params.requestId)
      .accountsPartial({
        user: params.userWallet,
        pool: poolPda,
        userBet: betPda,
        validator: TEE_VALIDATOR,
      })
      .instruction(),
  );

  console.log(`[L1]   🚀 Sending transaction to initialize bet and delegation...`, tx)

  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = params.userWallet

  console.log("[placeEncryptedBet] Signing transaction...")
  const signedTx = await params.signTransaction({
    transaction: tx,
    connection
  });

  console.log("[placeEncryptedBet] Sending transaction...")
  const txSignature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  console.log("[placeEncryptedBet] Confirming transaction...")
  await connection.confirmTransaction(txSignature, "confirmed")

  console.log(`[L1]   ✅ L1 Transaction confirmed: ${txSignature}`)
  console.log(`[L1]   ⏳  Waiting for TEE to index delegation...`)

  await waitUntilPermissionActive(TEE_URL, betPda)

  console.log(`[L1]   ✨ TEE synchronization complete`)

  return {
    betPda,
    permissionPda,
    txSignature,
  }
}

export async function executeBetOnTee(params: {
  program: Program<any>
  userWallet: PublicKey
  poolPubkey: PublicKey
  betPubkey: PublicKey
  prediction: BN
  requestId: string
  signTransaction: (args: any) => Promise<Transaction>
  signMessage: (args: any) => Promise<Uint8Array>
  wallet: any
}): Promise<TEEExecutionResult> {
  console.log("[TEE] 🎯 Executing private bet on TEE...")

  const provider = new AnchorProvider(
    connection,
    params.wallet as any,
    AnchorProvider.defaultOptions(),
  )
  const program = new Program(IDL as any, provider) as Program<SwivPrivacy>;

  const authToken = await getAuthToken(
    TEE_URL,
    params.userWallet,
    async (message: Uint8Array) => {
      const signatureUint8Array = (
        await params.signMessage({
          message: message,
          options: {
            uiOptions: {
              title: 'Sign this message'
            }
          }
        })
      );
      return signatureUint8Array;
    },
  )

  console.log(`[TEE]   🔐 Obtained TEE auth token, ${TEE_URL}?token=${authToken.token}`)

  const teeConnection = new Connection(`${TEE_URL}?token=${authToken.token}`, {
    commitment: "confirmed",
    wsEndpoint: `${TEE_WS_URL}?token=${authToken.token}`,
  })

  console.log(`[TEE]   🚀 Sending placeBet to TEE (Prediction: ${params.prediction.toString()})...`)

  const placeBetIx = await program.methods
    .placeBet(params.prediction, params.requestId)
    .accountsPartial({
      user: params.userWallet,
      pool: params.poolPubkey,
      userBet: params.betPubkey,
    })
    .instruction()

  const tx = new web3.Transaction().add(placeBetIx)
  tx.feePayer = params.userWallet

  const { blockhash } = await teeConnection.getLatestBlockhash()
  tx.recentBlockhash = blockhash

  const signedTx = await params.signTransaction({
    transaction: tx,
    connection
  });

  console.log("[placeEncryptedBet] on TEE Sending transaction...", signedTx)
  const signature = await teeConnection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  console.log("[placeEncryptedBet] on TEE Confirming transaction...")
  await teeConnection.confirmTransaction(signature, "confirmed")
  const teeSignature = signature.toString()

  console.log(`[TEE]   ✅ Bet executed privately on TEE: ${teeSignature}`)
  await sleep(1000) 

  return {
    teeSignature,
    delegationMetadata: delegationMetadataPdaFromDelegatedAccount(params.betPubkey),
  }
}

export async function saveBetToDatabase(params: {
  poolId: string
  userWallet: PublicKey
  betPubkey: PublicKey
  stakeAmount: BN
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

export async function placeEncryptedBet(params: PlaceBetParams): Promise<Prediction> {
  try {
    console.log("\n==========================================")
    console.log("🎲 STARTING FULL BET PLACEMENT FLOW")
    console.log("==========================================\n")

    const provider = new AnchorProvider(
      connection,
      params.wallet as any,
      AnchorProvider.defaultOptions(),
    )
    const program = new Program(IDL as any, provider) as Program<SwivPrivacy>;

    console.log("STEP 1: L1 INITIALIZATION & DELEGATION\n")
    const l1Result = await initBetAndDelegate(params)

    console.log("\nSTEP 2: TEE PRIVATE BET EXECUTION\n")
    const teeResult = await executeBetOnTee({
      program: program,
      userWallet: params.userWallet,
      poolPubkey: params.poolPubkey,
      betPubkey: l1Result.betPda,
      prediction: params.prediction,
      requestId: params.requestId,
      signTransaction: params.signTransaction,
      signMessage: params.signMessage,
      wallet: params.wallet,
    })

    console.log("\nSTEP 3: DATABASE PERSISTENCE\n")
    const dbResult = await saveBetToDatabase({
      poolId: params.poolId,
      userWallet: params.userWallet,
      betPubkey: l1Result.betPda,
      stakeAmount: params.stakeAmount,
      requestId: params.requestId,
      l1TxSignature: l1Result.txSignature,
      teeTxSignature: teeResult.teeSignature,
    })

    console.log("\n==========================================")
    console.log("✅ BET PLACEMENT COMPLETE!")
    console.log("==========================================")
    console.log(`Bet Account: ${l1Result.betPda.toBase58()}`)
    console.log(`Permission Account: ${l1Result.permissionPda.toBase58()}`)
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

export async function claimPredictionReward(predictionId: string): Promise<Prediction> {
  throw new Error("Claim reward not yet implemented")
}