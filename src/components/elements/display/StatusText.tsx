import { accentPaint } from '@/declarations/ui/theme'
import { STATUS_TEXT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface StatusTextProps {
  label: string
  accent?: string | null
  className?: string
}

/**
 * Status in plain words, its colour carried by the word itself, never by a bullet
 * @param {string} label - Status name
 * @param {string | null} [accent] - Stored colour
 * @param {string} [className] - Extra classes
 * @return {JSX.Element}
 */

export const StatusText = ({ label, accent, className }: StatusTextProps) => {
  const paint = accentPaint(accent, 'neutral')

  return (
    <span className={cn(STATUS_TEXT.root, paint.text, className)} style={paint.style}>
      {label}
    </span>
  )
}
