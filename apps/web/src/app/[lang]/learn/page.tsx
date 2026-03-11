"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useLang } from "@/components/LangProvider";

const LESSON_CONFIG = [
  { href: "/learn/memecoin-101", emoji: "🎓", color: "#818CF8", isCase: false },
  { href: "/learn/wash-trading", emoji: "🔄", color: "#F87171", isCase: false },
  { href: "/learn/wallet-clustering", emoji: "🔗", color: "#FBBF24", isCase: false },
  { href: "/learn/case/pippinu", emoji: "🔍", color: "#FB923C", isCase: true },
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
  const { t, lang } = useLang();

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
            {t.learn.badge}
          </div>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight mb-4"
            style={{ color: "var(--cg-text)", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            {t.learn.h1_main}{" "}
            <span style={{ background: "var(--cg-gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t.learn.h1_sub}
            </span>
          </h1>
          <p className="text-base font-medium max-w-xl mx-auto" style={{ color: "var(--cg-text-muted)" }}>
            {t.learn.desc}
          </p>
        </motion.div>

        {/* Dersler */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {t.learn.lessons.map((lessonText: any, index: number) => {
            const config = LESSON_CONFIG[index];
            return (
              <Link key={config.href} href={`/${lang}${config.href}`} className="block outline-none">
                <motion.div
                  variants={itemVariants}
                  className="bento-card p-6 text-left group overflow-hidden relative cursor-pointer h-full flex flex-col"
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  style={{
                    borderLeft: `3px solid ${config.color}80`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle at right, ${config.color}, transparent 60%)`, mixBlendMode: 'screen' }}
                  />

                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${config.color}15`, border: `1px solid ${config.color}30`, boxShadow: `0 0 20px ${config.color}20` }}
                    >
                      {config.emoji}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="metric-badge px-2.5 py-1 text-[10px]"
                        style={{
                          background: config.isCase ? "rgba(251,146,60,0.15)" : `${config.color}15`,
                          color: config.color,
                          border: `1px solid ${config.color}30`,
                        }}
                      >
                        {lessonText.tag}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-black tracking-tight mb-2 group-hover:text-white transition-colors duration-300 relative z-10" style={{ color: "var(--cg-text)" }}>
                    {lessonText.title}
                  </h2>
                  <p className="text-sm font-medium leading-relaxed mb-6 relative z-10 flex-1" style={{ color: "var(--cg-text-muted)" }}>
                    {lessonText.desc}
                  </p>
                  <div className="flex items-center justify-between mt-auto relative z-10 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide opacity-60" style={{ color: "var(--cg-text-dim)" }}>
                      <ClockIcon />
                      {lessonText.readTime}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform" style={{ color: config.color }}>
                      {t.learn.read_btn}
                    </span>
                  </div>
                </motion.div>
              </Link>
            )
          })}
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
            {t.learn.cta_title}
          </p>
          <p className="text-sm font-medium mb-6 relative z-10" style={{ color: "var(--cg-text-muted)" }}>
            {t.learn.cta_desc}
          </p>
          <Link href={`/${lang}/`} className="cta-button inline-block px-10 py-4 text-sm font-bold relative z-10 rounded-[1.25rem] outline-none">
            {t.learn.btn_analyze}
          </Link>
        </motion.div>

        <footer className="text-center py-10 opacity-60">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cg-text-dim)" }}>
            {t.learn.disclaimer}
          </p>
        </footer>
      </div>
    </main>
  );
}