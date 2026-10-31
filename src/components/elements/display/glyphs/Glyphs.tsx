import type { ReactNode } from 'react'

// GlyphProps
export interface GlyphProps {
  className?: string
}

/**
 * Wraps a stroke drawing in a 24 square
 * @param {Object} props - Sizing class
 * @return {JSX.Element}
 */

export const Stroke = ({
  className,
  width = 2,
  children,
}: GlyphProps & { width?: number; children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
)

/**
 * Skip
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const SkipGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M6 5.5v13l9-6.5-9-6.5zM19 5v14" />
  </Stroke>
)

/**
 * Flame
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const FlameGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <path d="M12 21c-4 0-7-2.7-7-6.3 0-3 1.7-5.2 2.8-7.4.4 1.7 1.2 2.8 2.2 3.3-.4-2.6.6-5.1 3-7.1-.1 2.1.9 3.7 2.4 5.2 1.8 1.8 3.6 3.7 3.6 6 0 3.6-3 6.3-7 6.3Z" />
  </Stroke>
)

/**
 * Crown
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const CrownGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <path d="M5 18h14" />
    <path d="M5 18 4 9l4.5 3.5L12 6l3.5 6.5L20 9l-1 9Z" />
  </Stroke>
)

/**
 * Briefcase line glyph
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const BriefcaseGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <rect x="3.5" y="8" width="17" height="11.5" rx="2.5" />
    <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
    <path d="M3.5 13h17" />
  </Stroke>
)
