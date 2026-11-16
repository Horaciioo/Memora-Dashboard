import { useId } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'
import { frameOf, skinOf } from '@/core/lib/play/skins'
import { FRAME_GEOMETRY as G } from '@/declarations/play/skinGeometry'
import { LEVEL_FRAME_VIEW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Portrait pixels by size, the frame grows around them
const FACE_PX: Partial<Record<AvatarSize, number>> = { xs: 24, sm: 32, md: 40, lg: 64, xl: 96 }

export interface LevelFrameProps {
  level: number
  name: string
  src: string | null
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  // Keeps the footprint of the plain portrait, the frame spills around it
  bleed?: boolean
}

const RAD = Math.PI / 180

/**
 * Hexagon points around the centre
 * @param {number} radius - Radius
 * @return {string} - Points
 */

const hex = (radius: number): string =>
  Array.from({ length: 6 }, (_, index) => {
    const angle = (-90 + 60 * index) * RAD

    return `${G.centre + radius * Math.cos(angle)},${G.centre + radius * Math.sin(angle)}`
  }).join(' ')

/**
 * Five-point star
 * @param {number} cx - Centre x
 * @param {number} cy - Centre y
 * @return {string} - Points
 */

const star = (cx: number, cy: number): string =>
  Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 ? G.starRadius * 0.45 : G.starRadius
    const angle = (-90 + 36 * index) * RAD

    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`
  }).join(' ')

/**
 * Portrait in its level frame, ornaments growing with the level like the old Overwatch borders
 * @param {LevelFrameProps} props - Portrait and level
 * @return {JSX.Element}
 */

export const LevelFrame = ({ level, name, src, size, className, bleed }: LevelFrameProps) => {
  const metal = `m${useId().replace(/:/g, '')}`
  const skin = skinOf(level)
  const { leaves, hasChin, hasArch, stars } = frameOf(level)
  const face = FACE_PX[size] ?? 64
  // Box where the portrait takes its share of the frame
  const box = Math.round((face * G.size) / (2 * G.face))
  const leafAt = (index: number) => {
    const angle = (G.leafFrom + G.leafStep * index) * RAD

    return {
      x: G.centre + G.leafRadius * Math.cos(angle),
      y: G.centre + G.leafRadius * Math.sin(angle),
      turn: G.leafFrom + G.leafStep * index + 90 + G.leafTilt,
    }
  }
  const leafMarks = Array.from({ length: leaves }, (_, index) => {
    const { x, y, turn } = leafAt(index)

    return (
      <g key={index} transform={`translate(${x} ${y}) rotate(${turn}) scale(${G.leafScale})`}>
        <path
          d={G.leaf}
          fill={`url(#${metal})`}
          stroke="var(--skin-ink)"
          strokeOpacity={0.4}
          strokeWidth={0.6}
        />
        <path
          d={G.vein}
          fill="none"
          stroke="var(--skin-ink)"
          strokeOpacity={0.45}
          strokeWidth={0.5}
        />
      </g>
    )
  })
  const archPoints = [210, 270, 330]
    .map((degrees) => {
      const angle = degrees * RAD

      return `${G.centre + G.archRadius * Math.cos(angle)},${G.centre + G.archRadius * Math.sin(angle)}`
    })
    .join(' ')

  return (
    <span
      data-skin={skin.key}
      className={cn(LEVEL_FRAME_VIEW.root, className)}
      style={bleed ? { width: face, height: face } : { width: box, height: box }}
    >
      <Avatar name={name} src={src} size={size} className={LEVEL_FRAME_VIEW.face} />
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${G.size} ${G.size}`}
        className={LEVEL_FRAME_VIEW.art}
        style={
          bleed
            ? {
                inset: 'auto',
                left: '50%',
                top: '50%',
                width: box,
                height: box,
                transform: 'translate(-50%, -50%)',
              }
            : undefined
        }
      >
        <defs>
          <linearGradient id={metal} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              style={{ stopColor: 'color-mix(in srgb, white 65%, var(--skin-from))' }}
            />
            <stop offset="0.4" style={{ stopColor: 'var(--skin-from)' }} />
            <stop offset="0.75" style={{ stopColor: 'var(--skin-to)' }} />
            <stop
              offset="1"
              style={{ stopColor: 'color-mix(in srgb, black 30%, var(--skin-to))' }}
            />
          </linearGradient>
        </defs>

        {/* Leaves open from the lower sides upward, mirrored on the right */}
        <g>{leafMarks}</g>
        <g transform={`translate(${G.size} 0) scale(-1 1)`}>{leafMarks}</g>

        {hasChin && (
          <path
            d={G.chin}
            fill={`url(#${metal})`}
            stroke="var(--skin-ink)"
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        )}

        <polygon
          points={hex(G.ring)}
          fill="none"
          stroke={`url(#${metal})`}
          strokeWidth={G.ringWidth}
          strokeLinejoin="round"
        />
        <polygon
          points={hex(G.ring + G.ringWidth / 2)}
          fill="none"
          stroke="var(--skin-ink)"
          strokeOpacity={0.45}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <polygon
          points={hex(G.ring - G.ringWidth / 2)}
          fill="none"
          stroke="var(--skin-ink)"
          strokeOpacity={0.55}
          strokeWidth={1}
          strokeLinejoin="round"
        />

        {hasArch && (
          <polyline
            points={archPoints}
            fill="none"
            stroke={`url(#${metal})`}
            strokeWidth={G.archWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {Array.from({ length: stars }, (_, index) => (
          <polygon
            key={index}
            points={star(G.centre + (index - (stars - 1) / 2) * G.starGap, G.starY)}
            fill={`url(#${metal})`}
            stroke="var(--skin-ink)"
            strokeOpacity={0.5}
            strokeWidth={0.8}
          />
        ))}
      </svg>
    </span>
  )
}
