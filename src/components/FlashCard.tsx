import { type ReactNode } from 'react'

interface FlashCardProps {
  front: ReactNode
  back: ReactNode
  isFlipped: boolean
  onClick: () => void
  className?: string
}

/**
 * 3D flip card — CSS preserve-3d, 350 ms easeInOut.
 * Front and back are absolutely positioned and hidden with backface-visibility.
 * Parent MUST have an explicit height (e.g. h-80) for the absolute children to fill.
 */
export default function FlashCard({
  front,
  back,
  isFlipped,
  onClick,
  className = '',
}: FlashCardProps) {
  return (
    <div
      className={`card-scene cursor-pointer select-none ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label="Gira la flashcard"
    >
      <div className={`card-inner${isFlipped ? ' flipped' : ''}`}>
        {/* ── FRONT ── */}
        <div
          className="card-face card-front"
          style={{
            background: '#0a0a0a',
            border: '1px solid #3a3a3f',
            borderRadius: '8px',
          }}
        >
          {front}
        </div>

        {/* ── BACK ── */}
        <div
          className="card-face card-back"
          style={{
            background: '#0a0a0a',
            border: '1px solid #3a3a3f',
            borderRadius: '8px',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
