"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-b704c.up.railway.app";

interface ApiKey {
  key_prefix: string;
  name: string;
  tier: string;
  daily_limit: number;
  daily_used: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string | null;
}

function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
    </svg>
  );
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function KeyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M11.3 11.3L21 3" />
      <path d="M19 5l2 2M16 5l2 2" />
    </svg>
  );
}

function GiftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

export default function KeysPage() {
  const router = useRouter();
  const [telegramId, setTelegramId] = useState("");
  const [inputId, setInputId] = useState("");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [referral, setReferral] = useState<{
    ref_code: string; bot_link: string; web_link: string;
    total_referrals: number; bonus_until: string | null; bonus_active: boolean;
  } | null>(null);

  // localStorage'dan telegram_id yükle
  useEffect(() => {
    const saved = localStorage.getItem("cg_telegram_id");
    if (saved) {
      setTelegramId(saved);
      setInputId(saved);
    }
  }, []);

  useEffect(() => {
    if (telegramId) {
      fetchKeys();
      fetchReferral();
    }
  }, [telegramId]);

  async function fetchReferral() {
    try {
      const res = await fetch(`${API_URL}/api/v1/referral/${telegramId}`);
      if (res.ok) setReferral(await res.json());
    } catch { /* sessiz */ }
  }

  async function fetchKeys() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/keys?telegram_id=${telegramId}`);
      if (!res.ok) throw new Error("Anahtarlar alınamadı.");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (e: any) {
      setError(e.message || "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    const id = inputId.trim();
    if (!id || isNaN(Number(id))) {
      setError("Geçerli bir Telegram ID girin.");
      return;
    }
    localStorage.setItem("cg_telegram_id", id);
    setTelegramId(id);
    setError("");
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_id: Number(telegramId), name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Anahtar oluşturulamadı.");
      setNewKeyValue(data.key);
      setNewKeyName("");
      await fetchKeys();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(prefix: string) {
    try {
      const res = await fetch(`${API_URL}/api/v1/keys/${prefix}?telegram_id=${telegramId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Silinemedi.");
      }
      setDeleteConfirm(null);
      await fetchKeys();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(newKeyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <main className="min-h-screen grid-bg">
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />

      {/* Navbar */}
      <nav className="nav-glass sticky top-0 z-50 px-6 md:px-10 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: "var(--cg-text-muted)" }}
        >
          ← Ana Sayfa
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", color: "white" }}
          >
            <ShieldIcon />
          </div>
          <span className="font-black text-sm" style={{ color: "var(--cg-text)" }}>ChainGuard</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <KeyIcon size={18} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--cg-text)" }}>
                API Anahtarları
              </h1>
              <p className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                ChainGuard API'ye programatik erişim için anahtar yönetimi
              </p>
            </div>
          </div>
        </div>

        {/* Giriş — Telegram ID */}
        {!telegramId ? (
          <div className="card-flat p-8 animate-slide-up">
            <h2 className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>
              Telegram ID ile Giriş
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--cg-text-muted)" }}>
              Telegram ID'nizi öğrenmek için bota{" "}
              <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.06)" }}>/stats</code>{" "}
              yazın.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Telegram ID (örn: 123456789)"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-mono"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--cg-text)",
                  outline: "none",
                }}
              />
              <button onClick={handleLogin} className="cta-button px-6 py-3 text-sm">
                Giriş
              </button>
            </div>
            {error && <p className="mt-3 text-xs" style={{ color: "#F87171" }}>{error}</p>}
          </div>
        ) : (
          <>
            {/* Yeni anahtar oluştur görseli */}
            {newKeyValue && (
              <div
                className="mb-6 p-5 rounded-2xl animate-slide-up"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#34D399" }}>
                  ✓ Anahtar oluşturuldu — Şimdi kopyalayın!
                </p>
                <div className="flex items-center gap-3">
                  <code
                    className="flex-1 text-xs font-mono px-3 py-2.5 rounded-lg truncate"
                    style={{ background: "rgba(0,0,0,0.3)", color: "#34D399" }}
                  >
                    {newKeyValue}
                  </code>
                  <button
                    onClick={copyKey}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: copied ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)",
                      color: copied ? "#34D399" : "var(--cg-text-muted)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <CopyIcon />
                    {copied ? "Kopyalandı!" : "Kopyala"}
                  </button>
                </div>
                <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Bu anahtar bir daha gösterilmeyecek. Güvenli bir yerde saklayın.
                </p>
                <button
                  onClick={() => setNewKeyValue("")}
                  className="mt-3 text-xs hover:opacity-80"
                  style={{ color: "var(--cg-text-dim)" }}
                >
                  Kapat ×
                </button>
              </div>
            )}

            {/* Yeni anahtar formu */}
            <div className="card-flat p-5 mb-6 animate-slide-up">
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--cg-text)" }}>
                Yeni Anahtar Oluştur
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Anahtar adı (örn: Discord Bot, Website)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createKey()}
                  maxLength={50}
                  className="flex-1 px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--cg-text)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={createKey}
                  disabled={creating || !newKeyName.trim() || keys.length >= 5}
                  className="flex items-center gap-2 cta-button px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PlusIcon />
                  {creating ? "Oluşturuluyor..." : "Oluştur"}
                </button>
              </div>
              {keys.length >= 5 && (
                <p className="mt-2 text-xs" style={{ color: "#FBBF24" }}>
                  Maksimum 5 anahtar limitine ulaştınız.
                </p>
              )}
              {error && <p className="mt-2 text-xs" style={{ color: "#F87171" }}>{error}</p>}
            </div>

            {/* Anahtar listesi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                  Mevcut Anahtarlar ({keys.length}/5)
                </h2>
                <button
                  onClick={() => { setTelegramId(""); localStorage.removeItem("cg_telegram_id"); }}
                  className="text-xs hover:opacity-80 transition-opacity"
                  style={{ color: "var(--cg-text-dim)" }}
                >
                  Çıkış
                </button>
              </div>

              {loading && (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="shimmer h-20 rounded-2xl" />)}
                </div>
              )}

              {!loading && keys.length === 0 && (
                <div className="card-flat p-10 text-center">
                  <p className="text-3xl mb-4">🔑</p>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--cg-text)" }}>Henüz API anahtarı yok</p>
                  <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                    Yukarıdaki formdan ilk anahtarınızı oluşturun.
                  </p>
                </div>
              )}

              {!loading && keys.map((key) => (
                <div key={key.key_prefix} className="card-flat p-5 animate-slide-up">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold" style={{ color: "var(--cg-text)" }}>
                          {key.name}
                        </span>
                        <span
                          className="metric-badge"
                          style={{
                            background: key.tier === "pro" ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.06)",
                            color: key.tier === "pro" ? "#818CF8" : "var(--cg-text-dim)",
                            border: `1px solid ${key.tier === "pro" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`,
                          }}
                        >
                          {key.tier.toUpperCase()}
                        </span>
                        {!key.is_active && (
                          <span className="metric-badge" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}>
                            Devre Dışı
                          </span>
                        )}
                      </div>
                      <code className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>
                        {key.key_prefix}...
                      </code>
                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>
                            Günlük Kullanım
                          </div>
                          <div className="text-xs font-bold font-mono" style={{ color: "var(--cg-text-muted)" }}>
                            {key.daily_used} / {key.daily_limit}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>
                            Son Kullanım
                          </div>
                          <div className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>
                            {formatDate(key.last_used_at)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>
                            Oluşturulma
                          </div>
                          <div className="text-xs font-mono" style={{ color: "var(--cg-text-dim)" }}>
                            {formatDate(key.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Usage bar */}
                      <div className="mt-3 score-bar" style={{ height: "3px" }}>
                        <div
                          className="score-bar-fill"
                          style={{
                            width: `${Math.min((key.daily_used / key.daily_limit) * 100, 100)}%`,
                            background: key.daily_used >= key.daily_limit ? "#F87171" : "linear-gradient(90deg, #6366F160, #6366F1)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Delete */}
                    {deleteConfirm === key.key_prefix ? (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => deleteKey(key.key_prefix)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          Evet, sil
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: "rgba(255,255,255,0.04)", color: "var(--cg-text-dim)" }}
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(key.key_prefix)}
                        className="p-2 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)", color: "var(--cg-text-dim)" }}
                        title="Anahtarı sil"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Referral Bölümü */}
            {referral && (
              <div className="card-flat p-6 mt-8 animate-slide-up">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}
                  >
                    <GiftIcon />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: "var(--cg-text)" }}>
                      Referral Programı
                    </h2>
                    <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
                      Arkadaşlarını davet et, ikisi de bonus kazan
                    </p>
                  </div>
                </div>

                {/* Ref link */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--cg-text-dim)" }}>
                    Davet Linkin
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 text-xs font-mono px-3 py-2.5 rounded-xl truncate"
                      style={{ background: "rgba(0,0,0,0.3)", color: "var(--cg-text-muted)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {referral.bot_link}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referral.bot_link);
                        setRefCopied(true);
                        setTimeout(() => setRefCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0"
                      style={{
                        background: refCopied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
                        color: refCopied ? "#34D399" : "var(--cg-text-muted)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <CopyIcon />
                      {refCopied ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: "var(--cg-text-dim)" }}>
                    Referral kodun: <code style={{ color: "#FBBF24" }}>{referral.ref_code}</code>
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Toplam Davet", value: referral.total_referrals.toString() },
                    { label: "Bonus Durumu", value: referral.bonus_active ? "Aktif ✓" : "Yok" },
                    { label: "Bonus Bitiş", value: referral.bonus_until ? new Date(referral.bonus_until).toLocaleDateString("tr-TR") : "—" },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="text-sm font-black mb-1" style={{ color: s.value.includes("Aktif") ? "#34D399" : "var(--cg-text)" }}>
                        {s.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rewards */}
                <div className="p-3 rounded-xl text-xs space-y-1.5" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                  <div style={{ color: "#FBBF24" }}>🎁 Sen davet edersen → <strong>7 gün</strong> artırılmış sorgu limiti</div>
                  <div style={{ color: "#FBBF24" }}>👋 Davet edilen → <strong>3 gün</strong> artırılmış sorgu limiti</div>
                </div>
              </div>
            )}

            {/* Kullanım Rehberi */}
            <div className="card-flat p-6 mt-8 animate-slide-up">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--cg-text-dim)" }}>
                Kullanım Rehberi
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--cg-text-muted)" }}>Python</p>
                  <pre
                    className="text-xs p-4 rounded-xl overflow-x-auto"
                    style={{ background: "rgba(0,0,0,0.3)", color: "#34D399", lineHeight: 1.7 }}
                  >{`import httpx

headers = {"X-CG-API-Key": "cg_live_..."}
resp = httpx.get(
    "https://web-production-b704c.up.railway.app/api/v1/token/<adres>",
    headers=headers
)
data = resp.json()
print(data["score"]["total"])  # Risk skoru`}</pre>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--cg-text-muted)" }}>JavaScript / Node.js</p>
                  <pre
                    className="text-xs p-4 rounded-xl overflow-x-auto"
                    style={{ background: "rgba(0,0,0,0.3)", color: "#818CF8", lineHeight: 1.7 }}
                  >{`const res = await fetch(
  "https://web-production-b704c.up.railway.app/api/v1/token/<adres>",
  { headers: { "X-CG-API-Key": "cg_live_..." } }
);
const { score } = await res.json();
console.log(score.total); // Risk skoru`}</pre>
                </div>
              </div>
              <div
                className="mt-4 p-3 rounded-xl text-xs"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#FBBF24" }}
              >
                Free plan: günlük 100 istek · Pro: 1.000 · Trader: 10.000
              </div>
            </div>
          </>
        )}

        <footer className="text-center py-10">
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            API anahtarlarınızı kimseyle paylaşmayın.
          </p>
        </footer>
      </div>
    </main>
  );
}
