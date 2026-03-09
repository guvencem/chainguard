"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  WALLETS,
  isWalletInstalled,
  connectAndVerify,
  type WalletId,
  type ChainType,
} from "@/lib/wallets";

interface VerifiedWallet {
  address: string;
  chain: ChainType;
  tier: string;
  daily_limit: number;
  token_amount: number;
  usd_value: number;
}

interface Props {
  telegramId?: number;
  onVerified?: (wallet: VerifiedWallet) => void;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free:   { label: "Ücretsiz",  color: "var(--cg-muted)" },
  holder: { label: "Holder",    color: "#10B981" },
  pro:    { label: "Pro",       color: "var(--cg-accent)" },
  trader: { label: "Trader",    color: "#F59E0B" },
};

const CHAIN_LABEL: Record<ChainType, string> = {
  solana: "Solana",
  evm: "EVM (Ethereum)",
};

function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletConnect({ telegramId, onVerified }: Props) {
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState<VerifiedWallet | null>(null);

  const handleConnect = useCallback(async (walletId: WalletId) => {
    setStatus("connecting");
    setMessage("Cüzdan bağlanıyor…");

    try {
      const result = await connectAndVerify(walletId, telegramId);
      setVerified(result);
      setStatus("success");
      setMessage("");
      onVerified?.(result);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Bağlantı başarısız.");
    }
  }, [telegramId, onVerified]);

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setVerified(null);
  };

  // ── Başarı ekranı ──────────────────────────────────────
  if (status === "success" && verified) {
    const tierInfo = TIER_LABELS[verified.tier] ?? TIER_LABELS.free;
    return (
      <div className="card-flat" style={{ padding: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
        <p style={{ color: "var(--cg-text-muted)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
          {CHAIN_LABEL[verified.chain]}
        </p>
        <p style={{
          fontFamily: "monospace",
          fontSize: "0.85rem",
          color: "var(--cg-text)",
          marginBottom: "1rem",
        }}>
          {shortenAddress(verified.address)}
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: tierInfo.color }}>
              {tierInfo.label}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--cg-text-muted)" }}>Tier</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cg-text)" }}>
              {verified.daily_limit.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--cg-text-muted)" }}>Günlük limit</div>
          </div>
          {verified.usd_value > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10B981" }}>
                ${verified.usd_value.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--cg-text-muted)" }}>CGT değeri</div>
            </div>
          )}
        </div>

        <button
          onClick={reset}
          style={{
            background: "transparent",
            border: "1px solid var(--cg-border)",
            borderRadius: "8px",
            color: "var(--cg-text-muted)",
            padding: "0.4rem 1rem",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Cüzdanı değiştir
        </button>
      </div>
    );
  }

  // ── Cüzdan seçim ekranı ──────────────────────────────
  return (
    <div className="card-flat" style={{ padding: "1.5rem" }}>
      <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>Cüzdanı Bağla</h3>
      <p style={{ color: "var(--cg-text-muted)", fontSize: "0.8rem", margin: "0 0 1.25rem" }}>
        CGT bakiyene göre tier aktif edilir. İmzalama işlemi token göndermez.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {WALLETS.map((wallet) => {
          const installed = isWalletInstalled(wallet.id);
          const isLoading = status === "connecting";

          return (
            <button
              key={wallet.id}
              disabled={isLoading}
              onClick={() => {
                if (!installed) {
                  window.open(wallet.downloadUrl, "_blank");
                  return;
                }
                handleConnect(wallet.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "var(--cg-surface)",
                border: "1px solid var(--cg-border)",
                borderRadius: "10px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                transition: "border-color 0.15s",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) (e.currentTarget as HTMLElement).style.borderColor = "var(--cg-accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--cg-border)";
              }}
            >
              <Image
                src={wallet.icon}
                alt={wallet.name}
                width={32}
                height={32}
                style={{ borderRadius: "8px" }}
                onError={(e) => {
                  // Fallback: emoji placeholder
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--cg-text)" }}>
                  {wallet.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--cg-text-muted)" }}>
                  {wallet.chain === "solana" ? "Solana" : "Ethereum / EVM"}
                </div>
              </div>
              <span style={{
                fontSize: "0.7rem",
                padding: "0.2rem 0.5rem",
                borderRadius: "6px",
                background: installed ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                color: installed ? "#10B981" : "var(--cg-text-muted)",
                border: `1px solid ${installed ? "rgba(16,185,129,0.3)" : "var(--cg-border)"}`,
              }}>
                {installed ? "Yüklü" : "İndir"}
              </span>
            </button>
          );
        })}
      </div>

      {status === "connecting" && (
        <p style={{
          marginTop: "1rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--cg-accent)",
        }}>
          {message}
        </p>
      )}

      {status === "error" && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px",
          fontSize: "0.8rem",
          color: "#F87171",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>{message}</span>
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "none",
              color: "#F87171",
              cursor: "pointer",
              fontSize: "1rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
