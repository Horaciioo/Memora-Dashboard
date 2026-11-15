import type { ReactNode } from 'react'

import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'

const RED = 'var(--stopgo-family-attack)'
const GREEN = 'var(--stopgo-car-green)'
const AMBER = 'var(--stopgo-gold)'
const FILL = 'currentColor'
const DIM = 'color-mix(in srgb, currentColor 22%, transparent)'

// Traffic light, one lamp lit
const light = (lit: 0 | 2, color: string) => (
  <>
    <rect x="15" y="4" width="18" height="40" rx="5" fill={FILL} />
    {[0, 1, 2].map((row) => (
      <circle key={row} cx="24" cy={13 + row * 11} r="4" fill={row === lit ? color : DIM} />
    ))}
  </>
)

// Round road sign with a number
const sign = (text: string, isOff: boolean) => (
  <>
    <circle cx="24" cy="24" r="19" fill="white" stroke={isOff ? FILL : RED} strokeWidth="5" />
    <text x="24" y="30" textAnchor="middle" fontSize="17" fontWeight="900" fill={FILL}>
      {text}
    </text>
    {isOff && <path d="M9 39 39 9" stroke={FILL} strokeWidth="4" strokeLinecap="round" />}
  </>
)

const drop = <path d="M24 4C24 4 10 20 10 29a14 14 0 0 0 28 0C38 20 24 4 24 4Z" fill={FILL} />

const tyre = (
  <>
    <circle cx="24" cy="24" r="18" fill={FILL} />
    <circle cx="24" cy="24" r="8" fill="white" />
  </>
)

const GLYPHS: Record<string, ReactNode> = {
  red: light(0, RED),
  green: light(2, GREEN),
  limit: sign('50', false),
  unlimit: sign('50', true),
  fuel: (
    <>
      {drop}
      <path d="M12 42 36 8" stroke={RED} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  petrol: (
    <>
      {drop}
      <path d="M24 22v14M17 29h14" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  flat: (
    <>
      {tyre}
      <path
        d="M38 6 30 17 38 21 31 30"
        stroke={RED}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  spare: tyre,
  crash: (
    <path
      d="m24 3 5 12 13-4-8 11 9 9-13-1-2 13-4-11-11 6 3-12-10-6 12-3Z"
      fill={RED}
      stroke={FILL}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  repair: (
    <path
      d="M33 5a10 10 0 0 0-9 13L6 36a4.5 4.5 0 0 0 6 6l18-18a10 10 0 0 0 13-9l-6 5-5-2-2-5Z"
      fill={FILL}
    />
  ),
  goodDraw: (
    <>
      <rect x="6" y="10" width="22" height="30" rx="4" fill={DIM} transform="rotate(-12 17 25)" />
      <rect x="20" y="8" width="22" height="30" rx="4" fill={FILL} transform="rotate(10 31 23)" />
      <path d="m31 14 2.2 5 5 .5-3.8 3.4 1.2 5-4.6-2.7-4.6 2.7 1.2-5-3.8-3.4 5-.5Z" fill={AMBER} />
    </>
  ),
  mystery: (
    <>
      <rect x="9" y="4" width="30" height="40" rx="5" fill={FILL} />
      <text x="24" y="33" textAnchor="middle" fontSize="26" fontWeight="900" fill={AMBER}>
        ?
      </text>
    </>
  ),
}

/**
 * Picture of a card, drawn on 48 × 48 in the ink colour of its parent
 * @param {Object} props - Glyph
 * @param {StopGoCardKey} props.name - Card
 * @return {JSX.Element | null}
 */

export const StopGoCardGlyph = ({ name }: { name: StopGoCardKey }) => {
  const art = GLYPHS[name]
  if (!art) return null

  return (
    <svg viewBox="0 0 48 48" className="size-full" aria-hidden>
      {art}
    </svg>
  )
}
