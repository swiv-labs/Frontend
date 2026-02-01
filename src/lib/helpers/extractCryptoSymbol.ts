/**
 * Helper function to extract crypto asset symbol from pool name
 * Looks for common crypto keywords in the pool name and maps to CoinGecko IDs
 * 
 * Examples:
 * "Bitcoin Price Pool" -> "bitcoin"
 * "Ethereum Trading" -> "ethereum"
 * "Solana Market" -> "solana"
 */

const CRYPTO_SYMBOL_MAP: Record<string, string> = {
  // Major cryptocurrencies
  bitcoin: "bitcoin",
  btc: "bitcoin",
  ethereum: "ethereum",
  eth: "ethereum",
  solana: "solana",
  sol: "solana",
  
  // Popular altcoins
  cardano: "cardano",
  ada: "cardano",
  polkadot: "polkadot",
  dot: "polkadot",
  ripple: "ripple",
  xrp: "ripple",
  litecoin: "litecoin",
  ltc: "litecoin",
  dogecoin: "dogecoin",
  doge: "dogecoin",
  
  // DeFi tokens
  uniswap: "uniswap",
  uni: "uniswap",
  aave: "aave",
  curve: "curve-dao-token",
  crv: "curve-dao-token",
  
  // Layer 2 / Scaling
  arbitrum: "arbitrum",
  arb: "arbitrum",
  optimism: "optimism",
  op: "optimism",
  polygon: "matic-network",
  matic: "matic-network",
  
  // Stablecoins
  usdc: "usd-coin",
  usdt: "tether",
  dai: "dai",
  
  // Other notable coins
  bnb: "binancecoin",
  binance: "binancecoin",
  chainlink: "chainlink",
  link: "chainlink",
  cosmos: "cosmos",
  atom: "cosmos",
  tezos: "tezos",
  xtz: "tezos",
  monero: "monero",
  xmr: "monero",
  zcash: "zcash",
  zec: "zcash",
};

export function extractCryptoSymbol(poolName: string): string | null {
  // Convert pool name to lowercase and split into words
  const lowerName = poolName.toLowerCase();
  
  // Check each word in the pool name against our map
  const words = lowerName.split(/[\s\-_]+/);
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, ""); // Remove special characters
    if (CRYPTO_SYMBOL_MAP[cleanWord]) {
      return CRYPTO_SYMBOL_MAP[cleanWord];
    }
  }
  
  // If no match found, return null
  return null;
}

/**
 * Get human-readable name for a crypto asset
 */
export function getCryptoDisplayName(coinId: string): string {
  const displayNames: Record<string, string> = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    solana: "Solana",
    cardano: "Cardano",
    polkadot: "Polkadot",
    ripple: "XRP",
    litecoin: "Litecoin",
    dogecoin: "Dogecoin",
    uniswap: "Uniswap",
    aave: "Aave",
    "curve-dao-token": "Curve",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
    "matic-network": "Polygon",
    "usd-coin": "USDC",
    tether: "USDT",
    dai: "DAI",
    binancecoin: "BNB",
    chainlink: "Chainlink",
    cosmos: "Cosmos",
    tezos: "Tezos",
    monero: "Monero",
    zcash: "Zcash",
  };
  
  return displayNames[coinId] || coinId.charAt(0).toUpperCase() + coinId.slice(1);
}
