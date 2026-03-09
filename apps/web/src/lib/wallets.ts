/**
 * ChainGuard — Multi-Wallet Connect
 *
 * Desteklenen cüzdanlar:
 *  Solana: Phantom, Solflare, Backpack
 *  EVM   : MetaMask
 *
 * Harici npm paketi yok — browser injection API'leri doğrudan kullanılıyor.
 */

export type WalletId = "phantom" | "solflare" | "backpack" | "metamask";
export type ChainType = "solana" | "evm";

export interface WalletInfo {
  id: WalletId;
  name: string;
  chain: ChainType;
  icon: string;          // SVG path veya emoji
  downloadUrl: string;
}

export interface ConnectedWallet {
  id: WalletId;
  name: string;
  chain: ChainType;
  address: string;
}

export const WALLETS: WalletInfo[] = [
  {
    id: "phantom",
    name: "Phantom",
    chain: "solana",
    icon: "/wallets/phantom.svg",
    downloadUrl: "https://phantom.app",
  },
  {
    id: "solflare",
    name: "Solflare",
    chain: "solana",
    icon: "/wallets/solflare.svg",
    downloadUrl: "https://solflare.com",
  },
  {
    id: "backpack",
    name: "Backpack",
    chain: "solana",
    icon: "/wallets/backpack.svg",
    downloadUrl: "https://backpack.app",
  },
  {
    id: "metamask",
    name: "MetaMask",
    chain: "evm",
    icon: "/wallets/metamask.svg",
    downloadUrl: "https://metamask.io",
  },
];

// ── Cüzdan Algılama ──────────────────────────────────────

declare global {
  interface Window {
    phantom?: { solana?: SolanaProvider };
    solflare?: SolanaProvider;
    backpack?: { solana?: SolanaProvider };
    xnft?: { solana?: SolanaProvider };
    ethereum?: EthereumProvider;
  }
}

interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  signMessage(msg: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
}

interface EthereumProvider {
  isMetaMask?: boolean;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

function getSolanaProvider(id: WalletId): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  switch (id) {
    case "phantom":
      return window.phantom?.solana ?? null;
    case "solflare":
      return window.solflare?.isSolflare ? window.solflare : null;
    case "backpack":
      return window.backpack?.solana ?? window.xnft?.solana ?? null;
    default:
      return null;
  }
}

function getEVMProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum?.isMetaMask ? window.ethereum : null;
}

export function isWalletInstalled(id: WalletId): boolean {
  if (typeof window === "undefined") return false;
  if (id === "metamask") return getEVMProvider() !== null;
  return getSolanaProvider(id) !== null;
}

// ── Bağlantı & İmzalama ──────────────────────────────────

export async function connectWallet(id: WalletId): Promise<string> {
  if (id === "metamask") {
    const provider = getEVMProvider();
    if (!provider) throw new Error("MetaMask yüklü değil.");
    const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts?.length) throw new Error("Hesap bulunamadı.");
    return accounts[0];
  }

  const provider = getSolanaProvider(id);
  if (!provider) throw new Error(`${id} cüzdanı yüklü değil.`);
  const resp = await provider.connect();
  return resp.publicKey.toString();
}

export async function signWalletMessage(
  id: WalletId,
  address: string,
  message: string,
): Promise<string> {
  if (id === "metamask") {
    const provider = getEVMProvider();
    if (!provider) throw new Error("MetaMask yüklü değil.");
    // personal_sign: hex-encoded message, EIP-191
    const hexMsg = "0x" + Buffer.from(message, "utf8").toString("hex");
    const sig = (await provider.request({
      method: "personal_sign",
      params: [hexMsg, address],
    })) as string;
    return sig; // 0x + 130 hex chars
  }

  const provider = getSolanaProvider(id);
  if (!provider) throw new Error(`${id} cüzdanı yüklü değil.`);
  const msgBytes = new TextEncoder().encode(message);
  const result = await provider.signMessage(msgBytes, "utf8");
  // base64 encode the Uint8Array signature
  return btoa(String.fromCharCode(...result.signature));
}

// ── Full Connect Flow ────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://web-production-b704c.up.railway.app";

export async function connectAndVerify(
  walletId: WalletId,
  telegramId?: number,
): Promise<{
  address: string;
  chain: ChainType;
  tier: string;
  daily_limit: number;
  token_amount: number;
  usd_value: number;
}> {
  const info = WALLETS.find((w) => w.id === walletId)!;

  // 1. Cüzdanı bağla — adres al
  const address = await connectWallet(walletId);

  // 2. Nonce iste
  const nonceRes = await fetch(`${API_BASE}/api/v1/wallet/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_address: address }),
  });
  if (!nonceRes.ok) throw new Error("Nonce alınamadı.");
  const { nonce, message } = await nonceRes.json();

  // 3. Mesajı imzala
  const signature = await signWalletMessage(walletId, address, message);

  // 4. Backend'e gönder — doğrula
  const verifyRes = await fetch(`${API_BASE}/api/v1/wallet/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet_address: address,
      signature,
      nonce,
      chain: info.chain,
      telegram_id: telegramId ?? null,
    }),
  });

  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.detail ?? "Doğrulama başarısız.");
  }

  const data = await verifyRes.json();
  return {
    address,
    chain: info.chain,
    tier: data.tier,
    daily_limit: data.daily_limit,
    token_amount: data.token_amount ?? 0,
    usd_value: data.usd_value ?? 0,
  };
}
