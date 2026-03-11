"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface LessonNavProps {
  prev?: { href: string; title: string };
  next?: { href: string; title: string };
}

export default function LessonNav({ prev, next }: LessonNavProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-0 w-full">
      {/* Background Mesh (Global to lessons) */}
      <div className="mesh-bg opacity-30 fixed inset-0 pointer-events-none -z-10" />
      
      {/* Global Navbar */}
      <Navbar />

      {/* Prev/Next Controls */}
      {(prev || next) && (
        <div className="flex justify-between gap-4 px-4 py-6 max-w-4xl mx-auto w-full relative z-10 pt-24">
          {prev ? (
            <button
              onClick={() => router.push(prev.href)}
              className="flex-1 bento-card p-5 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <div className="text-[10px] uppercase font-black tracking-widest mb-1.5" style={{ color: "var(--cg-text-dim)" }}>← Önceki Ders</div>
              <div className="text-base font-black tracking-tight" style={{ color: "var(--cg-text)" }}>{prev.title}</div>
            </button>
          ) : <div className="flex-1" />}
          
          {next ? (
            <button
              onClick={() => router.push(next.href)}
              className="flex-1 bento-card p-5 text-right transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <div className="text-[10px] uppercase font-black tracking-widest mb-1.5" style={{ color: "var(--cg-text-dim)" }}>Sonraki Ders →</div>
              <div className="text-base font-black tracking-tight" style={{ color: "var(--cg-text)" }}>{next.title}</div>
            </button>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  );
}
