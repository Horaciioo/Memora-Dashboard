import { useId } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { hexPath, LevelFrameFxBack, LevelFrameFxFront } from '@/composites/play/skin/LevelFrameFx'
import { LevelFrameWings } from '@/composites/play/skin/LevelFrameWings'
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

// Half-width of the drawing kept, small sizes crop to the metal so the frame hugs the portrait
const VIEW = { plain: 78, medal: 90, ornate: G.centre } as const

const corner = (radius: number, index: number) => ({
  x: G.centre + radius * Math.cos((-90 + 60 * index) * RAD),
  y: G.centre + radius * Math.sin((-90 + 60 * index) * RAD),
})

const stop = (offset: number, color: string, opacity?: number) => (
  <stop offset={offset} style={{ stopColor: color }} stopOpacity={opacity} />
)

/**
 * Portrait in its level frame, ornaments growing every ten levels inside a metal
 * @param {LevelFrameProps} props - Portrait and level
 * @return {JSX.Element}
 */

export const LevelFrame = ({ level, name, src, size, className, bleed }: LevelFrameProps) => {
  const id = `f${useId().replace(/:/g, '')}`
  const skin = skinOf(level)
  const hasMedal = size === 'xl' || size === 'lg'
  const base = frameOf(level)
  // Petals and ornaments at every size, glow and motion only where there is room
  const frame = hasMedal ? base : { ...base, fx: 0 }
  const view = base.wing || base.crest ? VIEW.ornate : hasMedal ? VIEW.medal : VIEW.plain
  const face = FACE_PX[size] ?? 64
  const box = Math.round((face * view) / G.face)
  const metal = `url(#${id}m)`
  const bottom = G.centre + G.medal.y
  const digits = String(level).length > 2 ? 15 : 18
  const hexOf = (radius: number) =>
    hexPath(radius)
      .replace(/[MLZ]/g, ' ')
      .trim()
      .replace(/\s{2,}/g, ' ')

  return (
    <span
      data-skin={skin.key}
      className={cn(LEVEL_FRAME_VIEW.root, className)}
      style={bleed ? { width: face, height: face } : { width: box, height: box }}
    >
      <Avatar name={name} src={src} size={size} className={LEVEL_FRAME_VIEW.face} />
      <svg
        aria-hidden="true"
        viewBox={`${G.centre - view} ${G.centre - view} ${2 * view} ${2 * view}`}
        data-fx={frame.fx}
        className={cn(LEVEL_FRAME_VIEW.art, 'skin-art')}
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
          <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
            {stop(0, 'var(--skin-a)')}
            {stop(0.45, 'var(--skin-b)')}
            {stop(1, 'var(--skin-c)')}
          </linearGradient>
          <linearGradient id={`${id}n`} x1="0" y1="1" x2="0" y2="0">
            {stop(0, 'var(--skin-a)')}
            {stop(0.5, 'var(--skin-b)')}
            {stop(1, 'var(--skin-c)')}
          </linearGradient>
          <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
            {stop(0, 'var(--skin-c)')}
            {stop(0.35, 'var(--skin-b)')}
            {stop(1, 'var(--skin-a)')}
          </linearGradient>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
            {stop(0, '#fff', 0)}
            {stop(0.5, '#fff', 0.85)}
            {stop(1, '#fff', 0)}
          </linearGradient>
          <radialGradient
            id={`${id}h`}
            gradientUnits="userSpaceOnUse"
            cx={G.centre}
            cy={G.centre}
            r={G.halo}
          >
            {stop(0.45, 'var(--skin-b)', 0.38)}
            {stop(1, 'var(--skin-b)', 0)}
          </radialGradient>
          <clipPath id={`${id}k`}>
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d={`${hexPath(G.metal)} ${hexPath(G.hollow)}`}
            />
          </clipPath>
          <clipPath id={`${id}o`}>
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d={`M-100 -100H340V340H-100Z ${hexPath(G.face)}`}
            />
          </clipPath>
          <clipPath id={`${id}c`}>
            <path d={hexPath(G.face - 1)} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${id}o)`}>
          <LevelFrameFxBack fx={frame.fx} id={id} />
        </g>
        <LevelFrameWings step={frame} fill={`url(#${id}w)`} />

        {frame.ring && (
          <>
            <polygon
              points={hexOf(G.ringLine)}
              fill="none"
              stroke="var(--skin-a)"
              strokeOpacity={0.85}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <polygon
              points={hexOf(G.ringOuter)}
              fill="none"
              stroke="var(--skin-c)"
              strokeOpacity={0.8}
              strokeWidth={1}
              strokeLinejoin="round"
            />
          </>
        )}

        <path fillRule="evenodd" d={`${hexPath(G.metal)} ${hexPath(G.hollow)}`} fill={metal} />
        <path
          fillRule="evenodd"
          d={`${hexPath(G.hollow)} ${hexPath(G.face)}`}
          fill={`url(#${id}n)`}
        />
        <polygon
          points={hexOf(G.metal)}
          fill="none"
          stroke="var(--skin-c)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <polygon
          points={hexOf(G.bevel)}
          fill="none"
          stroke="var(--skin-hi)"
          strokeOpacity={0.75}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <polygon
          points={hexOf(G.hollow)}
          fill="none"
          stroke="var(--skin-c)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <polygon
          points={hexOf(G.hollowLine)}
          fill="none"
          stroke="var(--skin-hi)"
          strokeOpacity={0.45}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <polygon
          points={hexOf(G.face)}
          fill="none"
          stroke="var(--skin-c)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <polygon
          points={hexOf(G.face)}
          fill="none"
          stroke="#000"
          strokeOpacity={0.35}
          strokeWidth={3}
          strokeLinejoin="round"
          clipPath={`url(#${id}c)`}
        />

        {frame.studs &&
          Array.from({ length: 6 }, (_, index) => {
            const { x, y } = corner(G.metal, index)

            return (
              <g key={index}>
                <circle cx={x} cy={y} r={G.studRadius} fill="var(--skin-c)" />
                <circle cx={x} cy={y} r={G.studRadius - 1} fill="var(--skin-b)" />
                <circle cx={x - 0.8} cy={y - 0.9} r={1} fill="var(--skin-hi)" />
              </g>
            )
          })}

        {frame.gem && (
          <g>
            <path
              d={`M${G.centre} ${G.centre + G.gem.y} l9 10 l-9 12 l-9 -12z`}
              fill="var(--skin-gem)"
              stroke="var(--skin-c)"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <path
              d={`M${G.centre} ${G.centre + G.gem.y + 3} l4 7 l-4 3 l-4 -3z`}
              fill="#fff"
              fillOpacity={0.55}
            />
          </g>
        )}

        {hasMedal && (
          <>
            {/* Level medal laid on the lower frame */}
            <circle
              cx={G.centre}
              cy={bottom}
              r={G.medal.radius}
              fill={metal}
              stroke="var(--skin-c)"
              strokeWidth={1.6}
            />
            <circle
              cx={G.centre}
              cy={bottom}
              r={G.medal.inner}
              fill="#0d0e11"
              stroke="var(--skin-hi)"
              strokeOpacity={0.5}
            />
            <text
              x={G.centre}
              y={bottom + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontWeight={700}
              fontSize={digits}
              fill="var(--skin-hi)"
            >
              {level}
            </text>
          </>
        )}

        <LevelFrameFxFront fx={frame.fx} id={id} />
      </svg>
    </span>
  )
}
