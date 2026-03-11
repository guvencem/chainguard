"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  className?: string
  style?: React.CSSProperties
  prefix?: string
  suffix?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function AnimatedCounter({
  value,
  duration = 1800,
  decimals = 0,
  className,
  style,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = eased * value
      setDisplay(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration, decimals])

  return (
    <span className={className} style={style}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
