import type { ReactNode } from 'react'

import { SUSPENS_BANNER } from '@/declarations/play/suspens/banner'

interface Place {
  x: number
  y: number
  scale: number
}

/**
 * Brick wall and the neon glow filter
 * @param {object} props - Id prefix and size
 * @return {JSX.Element}
 */

export const SuspensWall = ({
  id,
  width,
  height,
  scale = 1,
}: {
  id: string
  width: number
  height: number
  scale?: number
}) => {
  const brick = {
    width: SUSPENS_BANNER.brick.width * scale,
    height: SUSPENS_BANNER.brick.height * scale,
  }

  return (
    <>
      <defs>
        <pattern
          id={`${id}-bricks`}
          width={brick.width}
          height={brick.height * 2}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={brick.width}
            height={brick.height * 2}
            style={{ fill: 'var(--suspens-mortar)' }}
          />
          <rect
            x="2"
            y="2"
            width={brick.width - 4}
            height={brick.height - 4}
            rx="3"
            style={{ fill: 'var(--suspens-brick)' }}
          />
          <rect
            x={-brick.width / 2 + 2}
            y={brick.height + 2}
            width={brick.width - 4}
            height={brick.height - 4}
            rx="3"
            style={{ fill: 'var(--suspens-brick)' }}
          />
          <rect
            x={brick.width / 2 + 2}
            y={brick.height + 2}
            width={brick.width - 4}
            height={brick.height - 4}
            rx="3"
            style={{ fill: 'var(--suspens-brick)' }}
          />
        </pattern>
        <filter id={`${id}-neon`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={8 * scale} result="far" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={2.5 * scale} result="near" />
          <feMerge>
            <feMergeNode in="far" />
            <feMergeNode in="near" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-spill`} r="0.6">
          <stop offset="0" style={{ stopColor: 'var(--suspens-neon)' }} stopOpacity="0.22" />
          <stop offset="1" style={{ stopColor: 'var(--suspens-neon)' }} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-bricks)`} />
      <rect width={width} height={height} fill="black" opacity="0.35" />
    </>
  )
}

/**
 * Neon tube: dark glass under a bright core
 * @param {object} props - Path, colour, width, filter id and extra children
 * @return {JSX.Element}
 */

export const SuspensTube = ({
  d,
  token,
  width,
  id,
  children,
}: {
  d: string
  token: string
  width: number
  id: string
  children?: ReactNode
}) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke="black" strokeOpacity="0.5" strokeWidth={width * 1.8} />
    <g>
      {children}
      <path
        d={d}
        style={{ stroke: `var(${token})` }}
        strokeWidth={width}
        filter={`url(#${id}-neon)`}
      />
      <path d={d} stroke="white" strokeOpacity="0.7" strokeWidth={width * 0.3} />
    </g>
  </g>
)

/**
 * Word sign: lit letters and dark blanks
 * @param {object} props - Place, id prefix and letter children
 * @return {JSX.Element}
 */

export const SuspensWord = ({
  place,
  id,
  flicker,
}: {
  place: { x: number; y: number; size: number }
  id: string
  flicker?: (index: number) => ReactNode
}) => {
  const step = place.size * 1.15
  const start = place.x - (step * (SUSPENS_BANNER.word.length - 1)) / 2

  return (
    <g
      textAnchor="middle"
      fontWeight="800"
      fontSize={place.size}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {SUSPENS_BANNER.word.map((letter, index) => {
        const x = start + index * step

        return letter ? (
          <text
            key={index}
            x={x}
            y={place.y}
            fill="none"
            style={{ stroke: 'var(--suspens-neon)' }}
            strokeWidth={place.size * 0.06}
            filter={`url(#${id}-neon)`}
          >
            {flicker?.(index)}
            {letter}
          </text>
        ) : (
          <path
            key={index}
            d={`M${x - place.size * 0.36} ${place.y + place.size * 0.08}h${place.size * 0.72}`}
            style={{ stroke: 'var(--suspens-neon)' }}
            strokeOpacity="0.35"
            strokeWidth={place.size * 0.08}
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}

/**
 * Gallows group placed on the wall
 * @param {object} props - Place and content
 * @return {JSX.Element}
 */

export const SuspensStage = ({ place, children }: { place: Place; children: ReactNode }) => (
  <g transform={`translate(${place.x} ${place.y}) scale(${place.scale})`}>{children}</g>
)
