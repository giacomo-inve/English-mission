interface ProgressBarProps {
  value: number   // 0–100
  className?: string
}

export default function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      className={['w-full bg-bg-section overflow-hidden', className].join(' ')}
      style={{ height: '2px', borderRadius: '1px' }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-white transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
