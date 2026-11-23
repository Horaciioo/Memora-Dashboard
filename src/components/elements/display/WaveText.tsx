import type { CSSProperties } from 'react'

import { cn } from '@/utils/classnames'

export interface WaveTextProps {
  text: string
  className?: string
}

/**
 * Text whose letters turn white one after the other, in a wave that keeps running
 * @param {string} text - Words shown
 * @param {string} [className] - Extra classes
 * @return {JSX.Element}
 */

export const WaveText = ({ text, className }: WaveTextProps) => (
  <span role="status" aria-label={text} className={cn('inline-flex whitespace-pre', className)}>
    {[...text].map((letter, index) => (
      <span
        key={index}
        aria-hidden="true"
        className="wave-letter"
        style={{ '--i': index } as CSSProperties}
      >
        {letter}
      </span>
    ))}
  </span>
)
