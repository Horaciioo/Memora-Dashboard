import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/utils/classnames'

/**
 * Round progress, an arc filling clockwise around its content
 * @param {Object} props - Ring
 * @param {number} props.ratio - 0 to 1
 * @param {boolean} [props.isOnDark] - Light arc over a coloured poster
 * @param {string} [props.className] - Size
 * @param {ReactNode} props.children - Centre
 * @return {JSX.Element}
 */

export const QuestRing = ({
  ratio,
  isOnDark,
  className,
  children,
}: {
  ratio: number
  isOnDark?: boolean
  className?: string
  children: ReactNode
}) => {
  const isDone = ratio >= 1
  const arc = isDone ? 'var(--play-gold)' : isOnDark ? '#ffffff' : 'var(--play-key)'

  return (
    <span className={cn('relative grid shrink-0 place-items-center', className)}>
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          strokeWidth="5"
          stroke={
            isOnDark
              ? 'rgb(255 255 255 / 0.28)'
              : 'color-mix(in srgb, var(--play-ink) 16%, transparent)'
          }
        />
        {ratio > 0 && (
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            pathLength={100}
            stroke={arc}
            className="quest-ring-arc"
            style={{ '--ring-to': 100 - Math.round(ratio * 100) } as CSSProperties}
          />
        )}
      </svg>
      {children}
    </span>
  )
}
