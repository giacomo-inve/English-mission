import type { ReactNode } from 'react'

interface GhostButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-7 py-3 text-sm',
  lg: 'px-10 py-4 text-base',
}

export default function GhostButton({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  size = 'md',
}: GhostButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'btn-ghost font-mono tracking-display',
        sizeClasses[size],
        disabled ? 'opacity-30 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
