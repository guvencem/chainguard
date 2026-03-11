"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

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

function ClockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

export default function LearnPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen grid-bg relative overflow-x-hidden pt-16">
      <div className="mesh-bg opacity-30" />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            🎓 Eğitim Merkezi
          </div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight mb-4"
            style={{ color: "var(--cg-text)", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Kripto Güvenliği{" "}
            <span style={{ background: "var(--cg-gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Türkçe Öğren
            </span>
          </h1>
          <p className="text-base font-medium max-w-xl mx-auto" style={{ color: "var(--cg-text-muted)" }}>
            Memecoin dolandırıcılıklarını, rug pull'ları ve manipülasyon tekniklerini öğren.
            Gerçek vakalar, blockchain verileriyle desteklenmiş.
          </p>
        </motion.div>

        {/* Dersler */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {LESSONS.map((lesson) => (
            <motion.button
              key={lesson.href}
              variants={itemVariants}
              onClick={() => router.push(lesson.href)}
              className="bento-card p-6 text-left group overflow-hidden relative cursor-pointer"
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              style={{
                borderLeft: `3px solid ${lesson.color}80`,
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at right, ${lesson.color}, transparent 60%)`, mixBlendMode: 'screen' }}
              />

              <div className="flex items-start justify-between mb-5 relative z-10">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${lesson.color}15`, border: `1px solid ${lesson.color}30`, boxShadow: `0 0 20px ${lesson.color}20` }}
                >
                  {lesson.emoji}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="metric-badge px-2.5 py-1 text-[10px]"
                    style={{
                      background: lesson.isCase ? "rgba(251,146,60,0.15)" : `${lesson.color}15`,
                      color: lesson.color,
                      border: `1px solid ${lesson.color}30`,
                    }}
                  >
                    {lesson.tag}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-black tracking-tight mb-2 group-hover:text-white transition-colors duration-300 relative z-10" style={{ color: "var(--cg-text)" }}>
                {lesson.title}
              </h2>
              <p className="text-sm font-medium leading-relaxed mb-6 relative z-10" style={{ color: "var(--cg-text-muted)" }}>
                {lesson.desc}
              </p>
              <div className="flex items-center justify-between mt-auto relative z-10 border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-60" style={{ color: "var(--cg-text-dim)" }}>
                  <ClockIcon />
                  {lesson.readTime} okuma
                </div>
                <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform" style={{ color: lesson.color }}>
                  Okumaya Başla →
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bento-card p-10 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <p className="text-xl font-black tracking-tight mb-2 relative z-10" style={{ color: "var(--cg-text)", textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
            Ajan sistemini test et.
          </p>
          <p className="text-sm font-medium mb-6 relative z-10" style={{ color: "var(--cg-text-muted)" }}>
            Bir token adresini analiz et ve 9 metrikle gerçek riski gör.
          </p>
          <button onClick={() => router.push("/")} className="cta-button px-10 py-4 text-sm relative z-10 rounded-[1.25rem]">
            Analiz Et
          </button>
        </motion.div>

        <footer className="text-center py-10 opacity-60">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
            Tüm içerikler eğitim amaçlıdır. DYOR.
          </p>
        </footer>
      </div>
    </main>
  );
}