"use client";

import { useRouter } from "next/navigation";

const LESSONS = [
  {
    href: "/learn/memecoin-101",
    emoji: "🎓",
    tag: "Ders 1",
    title: "Memecoin 101",
    desc: "Memecoin nedir, rug pull nasıl çalışır, hangi sinyaller tehlike işareti? Yeni başlayanlar için kapsamlı rehber.",
    readTime: "8 dk",
    color: "#818CF8",
  },
  {
    href: "/learn/wash-trading",
    emoji: "🔄",
    tag: "Ders 2",
    title: "Wash Trading Tespiti",
    desc: "Yapay hacim nasıl oluşturulur? A→B→C→A döngüleri nedir? VLR metriki bu sinyalleri nasıl yakalar?",
    readTime: "6 dk",
    color: "#F87171",
  },
  {
    href: "/learn/wallet-clustering",
    emoji: "🔗",
    tag: "Ders 3",
    title: "Cüzdan Kümeleme & Sybil Attack",
    desc: "Bir kişi 400 farklı cüzdan açıp sahte holder sayısı nasıl şişirir? Blockchain grafı analizi nasıl çalışır?",
    readTime: "7 dk",
    color: "#FBBF24",
  },
  {
    href: "/learn/case/pippinu",
    emoji: "🔍",
    tag: "Vaka Çalışması",
    title: "PIPPINU Analizi",
    desc: "Gerçek bir rug pull'un adım adım anatomisi. Token oluşturma → sahte holder → pump → dump → %97 kayıp.",
    readTime: "10 dk",
    color: "#FB923C",
    isCase: true,
  },
];

function ShieldIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
    </svg>
  );
}

function ClockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function LearnPage() {
  const router = useRouter();

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
          <span className="font-black text-sm" style={{ color: "var(--cg-text)" }}>Taranoid</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 animate-slide-up text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            🎓 Eğitim Merkezi
          </div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight mb-4"
            style={{ color: "var(--cg-text)" }}
          >
            Kripto Güvenliği{" "}
            <span style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Türkçe Öğren
            </span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--cg-text-muted)" }}>
            Memecoin dolandırıcılıklarını, rug pull'ları ve manipülasyon tekniklerini öğren.
            Gerçek vakalar, blockchain verileriyle desteklenmiş.
          </p>
        </div>

        {/* Dersler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {LESSONS.map((lesson, i) => (
            <button
              key={lesson.href}
              onClick={() => router.push(lesson.href)}
              className="card-flat p-6 text-left group hover:scale-[1.01] transition-transform animate-slide-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                borderLeft: `3px solid ${lesson.color}40`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${lesson.color}12`, border: `1px solid ${lesson.color}20` }}
                >
                  {lesson.emoji}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="metric-badge"
                    style={{
                      background: lesson.isCase ? "rgba(251,146,60,0.1)" : `${lesson.color}12`,
                      color: lesson.color,
                      border: `1px solid ${lesson.color}20`,
                    }}
                  >
                    {lesson.tag}
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-black mb-2 group-hover:opacity-90 transition-opacity" style={{ color: "var(--cg-text)" }}>
                {lesson.title}
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cg-text-muted)" }}>
                {lesson.desc}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--cg-text-dim)" }}>
                  <ClockIcon />
                  {lesson.readTime} okuma
                </div>
                <span className="text-xs font-semibold group-hover:translate-x-0.5 transition-transform" style={{ color: lesson.color }}>
                  Okumaya Başla →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div
          className="card-flat p-8 text-center animate-slide-up"
          style={{ animationDelay: "0.3s", borderTop: "1px solid rgba(99,102,241,0.2)" }}
        >
          <p className="text-base font-bold mb-2" style={{ color: "var(--cg-text)" }}>
            Öğrendiklerini hemen uygula
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--cg-text-muted)" }}>
            Bir token adresini analiz et ve 9 metrikle gerçek riski gör.
          </p>
          <button onClick={() => router.push("/")} className="cta-button px-8 py-3 text-sm">
            Token Analiz Et
          </button>
        </div>

        <footer className="text-center py-10">
          <p className="text-xs" style={{ color: "var(--cg-text-dim)" }}>
            Tüm içerikler eğitim amaçlıdır. Yatırım tavsiyesi değildir.
          </p>
        </footer>
      </div>
    </main>
  );
}
