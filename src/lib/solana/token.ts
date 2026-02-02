import { Connection, PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddress, getAccount, AccountLayout } from "@solana/spl-token"

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed"
)

/**
 * Fetch the USDC token balance for a given wallet address
 * @param walletAddress - The wallet public key or address string
 * @returns The USDC balance in the smallest unit (lamports)
 */
export async function getUsdcBalance(walletAddress: string | PublicKey): Promise<number> {
  try {
    const wallet = typeof walletAddress === "string" ? new PublicKey(walletAddress) : walletAddress
    
    // USDC token mint address on mainnet and devnet
    const usdcMint = new PublicKey(process.env.NEXT_PUBLIC_USDC_TOKEN_MINT!)
    
    // Get the associated token account for USDC
    const tokenAccount = await getAssociatedTokenAddress(usdcMint, wallet)
    
    // Fetch the token account info
    const account = await connection.getTokenAccountBalance(tokenAccount)
    
    // Return the balance in the smallest unit (considering decimals)
    const balanceInSmallestUnit = BigInt(account.value.amount)
    return Number(balanceInSmallestUnit)
  } catch (error) {
    console.error("Error fetching USDC balance:", error)
    return 0
  }
}

/**
 * Fetch the USDC token balance and convert to human-readable format
 * @param walletAddress - The wallet public key or address string
 * @param decimals - Number of decimals for USDC (default 6)
 * @returns The USDC balance in human-readable format
 */
export async function getUsdcBalanceFormatted(
  walletAddress: string | PublicKey,
  decimals: number = 6
): Promise<number> {
  const balanceInSmallestUnit = await getUsdcBalance(walletAddress)
  return balanceInSmallestUnit / Math.pow(10, decimals)
}

/**
 * Fetch token account balance for any SPL token
 * @param walletAddress - The wallet public key or address string
 * @param tokenMint - The token mint address
 * @returns The token balance in the smallest unit
 */
export async function getTokenBalance(
  walletAddress: string | PublicKey,
  tokenMint: string | PublicKey
): Promise<number> {
  try {
    const wallet = typeof walletAddress === "string" ? new PublicKey(walletAddress) : walletAddress
    const mint = typeof tokenMint === "string" ? new PublicKey(tokenMint) : tokenMint
    
    const tokenAccount = await getAssociatedTokenAddress(mint, wallet)
    const account = await connection.getTokenAccountBalance(tokenAccount)
    
    return Number(BigInt(account.value.amount))
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return 0
  }
}

/**
 * Fetch SOL balance for a wallet
 * @param walletAddress - The wallet public key or address string
 * @returns The SOL balance in lamports
 */
export async function getSolBalance(walletAddress: string | PublicKey): Promise<number> {
  try {
    const wallet = typeof walletAddress === "string" ? new PublicKey(walletAddress) : walletAddress
    const balance = await connection.getBalance(wallet)
    return balance
  } catch (error) {
    console.error("Error fetching SOL balance:", error)
    return 0
  }
}
