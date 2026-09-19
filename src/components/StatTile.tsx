import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  className?: string
}

export default function StatTile({ label, value, sub, className = '' }: StatTileProps) {
  return (
    <div className={['data-tile', className].join(' ')}>
      <p
        className="text-white/40 font-mono text-xs tracking-widest"
        style={{ letterSpacing: '0.18em' }}
      >
        {label}
      </p>
      {/* Use div (not p) so block children like StreakTicks don't trigger validateDOMNesting */}
      <div className="text-white font-mono text-3xl tabular-nums leading-tight">
        {value}
      </div>
      {sub && (
        <div className="text-white/30 font-mono text-xs mt-1">{sub}</div>
      )}
    </div>
  )
}
