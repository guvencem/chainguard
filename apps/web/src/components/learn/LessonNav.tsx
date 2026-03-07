"use client";

import { useRouter } from "next/navigation";

interface LessonNavProps {
  prev?: { href: string; title: string };
  next?: { href: string; title: string };
}

function ShieldIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3L4 6.5v5c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-5L12 3z" />
    </svg>
  );
}

export default function LessonNav({ prev, next }: LessonNavProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-0">
      {/* Top nav */}
      <nav className="nav-glass sticky top-0 z-50 px-6 md:px-10 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push("/learn")}
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: "var(--cg-text-muted)" }}
        >
          ← Eğitim Merkezi
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

      {/* Prev/Next */}
      {(prev || next) && (
        <div className="flex justify-between gap-4 px-4 py-4 max-w-3xl mx-auto w-full">
          {prev ? (
            <button
              onClick={() => router.push(prev.href)}
              className="flex-1 card-flat p-4 text-left hover:opacity-80 transition-opacity"
            >
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>← Önceki</div>
              <div className="text-sm font-semibold" style={{ color: "var(--cg-text-muted)" }}>{prev.title}</div>
            </button>
          ) : <div className="flex-1" />}
          {next ? (
            <button
              onClick={() => router.push(next.href)}
              className="flex-1 card-flat p-4 text-right hover:opacity-80 transition-opacity"
            >
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--cg-text-dim)" }}>Sonraki →</div>
              <div className="text-sm font-semibold" style={{ color: "var(--cg-text-muted)" }}>{next.title}</div>
            </button>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  );
}
