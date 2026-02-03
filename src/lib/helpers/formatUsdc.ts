/**
 * Format USDC balance to a readable string with proper decimal places
 * @param balance - The USDC balance (in the smallest unit or already formatted)
 * @param decimals - Number of decimal places to display (default 2)
 * @returns Formatted USDC balance string
 */
export function formatUsdcBalance(
  balance: number,
  decimals: number = 2
): string {
  return balance.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format USDC balance with dollar sign
 * @param balance - The USDC balance
 * @param decimals - Number of decimal places to display (default 2)
 * @returns Formatted USDC balance string with dollar sign
 */
export function formatUsdcBalanceWithDollar(
  balance: number,
  decimals: number = 2
): string {
  return `$${formatUsdcBalance(balance, decimals)}`
}

/**
 * Format USDC balance with sign prefix (for PnL calculations)
 * @param balance - The USDC balance
 * @param decimals - Number of decimal places to display (default 2)
 * @returns Formatted USDC balance string with +/- sign
 */
export function formatUsdcBalanceWithSign(
  balance: number,
  decimals: number = 2
): string {
  const sign = balance >= 0 ? "+" : ""
  return `${sign}$${formatUsdcBalance(Math.abs(balance), decimals)}`
}
