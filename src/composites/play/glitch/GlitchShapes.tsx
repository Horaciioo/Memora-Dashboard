import type { ReactNode } from 'react'

import type { GlitchItem } from '@/core/lib/play/glitch'
import type { GlitchShapeName } from '@/declarations/play'
import { GLITCH_BOARD } from '@/declarations/ui/variants'

// Shapes drawn around the origin, ten units from the centre to the edge
export const GLITCH_PATHS: Record<GlitchShapeName, ReactNode> = {
  circle: <circle r="10" />,
  square: <rect x="-9" y="-9" width="18" height="18" rx="2.5" />,
  triangle: <path d="M0 -10.5 L10.5 8.5 L-10.5 8.5Z" />,
  diamond: <path d="M0 -11 L9 0 L0 11 L-9 0Z" />,
  star: (
    <path d="M0 -10.5 L2.59 -3.56 L9.99 -3.24 L4.18 1.36 L6.17 8.49 L0 4.4 L-6.17 8.49 L-4.18 1.36 L-9.99 -3.24 L-2.59 -3.56Z" />
  ),
  hexagon: <path d="M10 0 L5 8.66 L-5 8.66 L-10 0 L-5 -8.66 L5 -8.66Z" />,
  cross: <path d="M-3 -10 H3 V-3 H10 V3 H3 V10 H-3 V3 H-10 V-3 H-3Z" />,
  heart: <path d="M0 9.5 C-14 -1 -7 -11 0 -4.5 C7 -11 14 -1 0 9.5Z" />,
  pentagon: <path d="M0 -10.5 L9.99 -3.24 L6.17 8.49 L-6.17 8.49 L-9.99 -3.24Z" />,
  arrow: <path d="M0 -10 L9 0 H4 V10 H-4 V0 H-9Z" />,
}

/**
 * Shape or label on the same ten unit scale
 * @param {Object} props - Mark
 * @param {string} props.shape - Shape key, empty for a label
 * @param {string} props.label - Figure or capital
 * @return {JSX.Element}
 */

export const GlitchMarkArt = ({ shape, label }: { shape: string; label: string }) =>
  shape ? (
    <g stroke="var(--glitch-ink)" strokeOpacity="0.3" strokeWidth="0.9" strokeLinejoin="round">
      {GLITCH_PATHS[shape as GlitchShapeName]}
    </g>
  ) : (
    <text
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={label.length > 1 ? 13 : 18}
      fontWeight="900"
    >
      {label}
    </text>
  )

/**
 * Element of a picture, placed, turned and sized
 * @param {Object} props - Element
 * @param {GlitchItem} props.item - Element
 * @return {JSX.Element}
 */

export const GlitchItemArt = ({ item }: { item: GlitchItem }) => (
  <g transform={`translate(${item.x} ${item.y}) rotate(${item.angle}) scale(${item.size / 10})`}>
    <g
      className={GLITCH_BOARD.item}
      style={{ fill: `var(--glitch-c${item.color})`, '--i': item.id } as React.CSSProperties}
    >
      <GlitchMarkArt shape={item.shape} label={item.label} />
    </g>
  </g>
)
