import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  subtext?: ReactNode
  children?: ReactNode
  icon?: ReactNode
  className?: string
}

export default function StatTile({
  label,
  value,
  sub,
  subtext,
  children,
  icon,
  className = '',
}: StatTileProps) {
  const subtitle = subtext ?? sub

  return (
    <div className={['data-tile', className].join(' ')}>
      <div className="flex items-center justify-between">
        <p
          className="text-text-content/40 font-mono text-xs tracking-widest uppercase"
          style={{ letterSpacing: '0.18em' }}
        >
          {label}
        </p>
        {icon && <span className="text-text-content/40">{icon}</span>}
      </div>

      <div className="text-text-display font-mono text-3xl tabular-nums leading-tight mt-1">
        {value}
      </div>

      {subtitle && (
        <div className="text-text-content/40 font-mono text-xs mt-1">{subtitle}</div>
      )}

      {children}
    </div>
  )
}
