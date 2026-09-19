import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

/**
 * Smoothly animates a numeric value with easeOutCubic.
 * Uses tabular-nums so digits don't cause layout shift.
 */
export default function AnimatedCounter({
  value,
  duration = 700,
  className = '',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value)
  const prevValue = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = prevValue.current
    prevValue.current = value

    if (start === value) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(start + (value - start) * eased))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span className={`tabular-nums ${className}`}>
      {display}
    </span>
  )
}
