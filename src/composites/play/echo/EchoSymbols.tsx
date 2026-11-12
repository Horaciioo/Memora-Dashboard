import type { ReactNode } from 'react'

import type { EchoSymbolKey } from '@/declarations/play'

// Flat fill with the shared ink outline
const paint = (color: string) => ({
  fill: `var(--echo-${color})`,
  stroke: 'var(--echo-ink)',
  strokeWidth: 3,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
})

// Outline only
const line = { ...paint('ink'), fill: 'none' }

/**
 * Drawings of the Echo symbols on a 64 box, one per deck key
 * @type {Record<EchoSymbolKey, ReactNode>}
 */

export const ECHO_ART: Record<EchoSymbolKey, ReactNode> = {
  hammer: (
    <>
      <rect x="29" y="26" width="7" height="32" rx="3" {...paint('wood')} />
      <rect x="10" y="9" width="44" height="20" rx="5" {...paint('grey')} />
      <rect x="10" y="9" width="12" height="20" rx="4" {...paint('red')} />
    </>
  ),
  shield: (
    <>
      <path d="M32 5l22 8v16c0 14-9 24-22 30C19 53 10 43 10 29V13z" {...paint('blue')} />
      <path d="M32 5l22 8v16c0 14-9 24-22 30z" {...paint('sky')} />
      <path d="M32 18v26M21 29h22" {...line} />
    </>
  ),
  crown: (
    <>
      <path d="M8 46L6 20l15 14 11-20 11 20 15-14-2 26z" {...paint('yellow')} />
      <rect x="8" y="46" width="48" height="9" rx="3" {...paint('orange')} />
      <circle cx="32" cy="38" r="3" {...paint('red')} />
    </>
  ),
  megaphone: (
    <>
      <path d="M8 24h12l26-14v44L20 40H8z" {...paint('red')} />
      <rect x="20" y="40" width="9" height="15" rx="3" {...paint('grey')} />
      <path d="M52 22c4 3 4 17 0 20" {...line} />
    </>
  ),
  heart: (
    <path
      d="M32 56C10 40 6 28 6 20c0-8 6-14 13-14 6 0 10 3 13 8 3-5 7-8 13-8 7 0 13 6 13 14 0 8-4 20-26 36z"
      {...paint('pink')}
    />
  ),
  star: (
    <path
      d="M32 5l7.5 17.5 19 1.5-14.5 12.5 4.5 18.5L32 44.5 15.5 55l4.5-18.5L5.5 24l19-1.5z"
      {...paint('yellow')}
    />
  ),
  clock: (
    <>
      <circle cx="32" cy="32" r="25" {...paint('white')} />
      <circle cx="32" cy="32" r="25" {...paint('purple')} fill="none" strokeWidth={6} />
      <path d="M32 16v17l11 7" {...line} />
    </>
  ),
  flag: (
    <>
      <rect x="11" y="6" width="6" height="52" rx="3" {...paint('grey')} />
      <path d="M17 9h35l-9 12 9 12H17z" {...paint('red')} />
    </>
  ),
  bell: (
    <>
      <path d="M32 6c-11 0-17 9-17 20v10l-6 9h46l-6-9V26C49 15 43 6 32 6z" {...paint('yellow')} />
      <path d="M26 50a6 6 0 0012 0z" {...paint('orange')} />
    </>
  ),
  key: (
    <>
      <circle cx="19" cy="23" r="14" {...paint('yellow')} />
      <circle cx="19" cy="23" r="5" {...paint('white')} />
      <path d="M29 33l24 24M42 46l7-7M49 53l6-6" {...paint('yellow')} strokeWidth={6} />
    </>
  ),
  lock: (
    <>
      <path d="M20 28V19a12 12 0 0124 0v9" {...line} strokeWidth={6} />
      <rect x="10" y="28" width="44" height="30" rx="7" {...paint('orange')} />
      <circle cx="32" cy="41" r="4" {...paint('ink')} />
      <path d="M32 43v8" {...line} />
    </>
  ),
  eye: (
    <>
      <path
        d="M3 32C12 17 22 11 32 11s20 6 29 21c-9 15-19 21-29 21S12 47 3 32z"
        {...paint('white')}
      />
      <circle cx="32" cy="32" r="12" {...paint('purple')} />
      <circle cx="32" cy="32" r="5" {...paint('ink')} />
    </>
  ),
  chat: (
    <>
      <path
        d="M12 8h40a7 7 0 017 7v22a7 7 0 01-7 7H32L18 56V44h-6a7 7 0 01-7-7V15a7 7 0 017-7z"
        {...paint('white')}
      />
      <path d="M17 21h30M17 31h18" {...line} />
    </>
  ),
  ghost: (
    <>
      <path d="M10 56V30C10 16 20 7 32 7s22 9 22 23v26l-7-6-7 6-8-6-8 6-7-6z" {...paint('white')} />
      <ellipse cx="24" cy="30" rx="3.5" ry="5" {...paint('ink')} />
      <ellipse cx="40" cy="30" rx="3.5" ry="5" {...paint('ink')} />
    </>
  ),
  skull: (
    <>
      <path
        d="M32 6C17 6 8 16 8 29c0 8 4 13 10 16v9h28v-9c6-3 10-8 10-16C56 16 47 6 32 6z"
        {...paint('white')}
      />
      <circle cx="22" cy="30" r="6" {...paint('ink')} />
      <circle cx="42" cy="30" r="6" {...paint('ink')} />
      <path d="M32 38l-3 6h6zM26 46v8M32 46v8M38 46v8" {...line} />
    </>
  ),
  bolt: <path d="M38 4L12 36h16l-4 24 28-34H35z" {...paint('yellow')} />,
  flame: (
    <>
      <path
        d="M32 4c2 10 16 16 16 34a16 16 0 01-32 0c0-8 4-12 8-16 0 6 3 8 5 8-2-12 0-20 3-26z"
        {...paint('orange')}
      />
      <path d="M32 58a8 8 0 01-8-8c0-7 5-9 8-16 3 7 8 9 8 16a8 8 0 01-8 8z" {...paint('yellow')} />
    </>
  ),
  moon: (
    <>
      <path d="M44 6a26 26 0 100 52 22 22 0 01-14-24A22 22 0 0144 6z" {...paint('yellow')} />
      <circle cx="46" cy="40" r="2" {...paint('ink')} />
    </>
  ),
  sun: (
    <>
      <path
        d="M32 3v8M32 53v8M3 32h8M53 32h8M11 11l6 6M47 47l6 6M53 11l-6 6M17 47l-6 6"
        {...line}
        strokeWidth={5}
      />
      <circle cx="32" cy="32" r="14" {...paint('yellow')} />
    </>
  ),
  cloud: (
    <>
      <path d="M17 50a12 12 0 01-1-24 16 16 0 0130-3 13 13 0 013 27z" {...paint('sky')} />
      <path d="M22 36a10 10 0 0110-8" {...line} stroke="var(--echo-white)" />
    </>
  ),
  gem: (
    <>
      <path d="M17 8h30l12 15-27 33L5 23z" {...paint('sky')} />
      <path d="M5 23h54M23 23l9 33M41 23l-9 33M17 8l6 15 9-15 9 15 6-15" {...line} />
    </>
  ),
  magnifier: (
    <>
      <path d="M40 40l16 16" {...paint('wood')} strokeWidth={8} />
      <circle cx="26" cy="26" r="18" {...paint('white')} />
      <circle cx="26" cy="26" r="18" {...paint('blue')} fill="none" strokeWidth={6} />
    </>
  ),
  trophy: (
    <>
      <path d="M16 8h32v18c0 9-7 15-16 15S16 35 16 26z" {...paint('yellow')} />
      <path d="M16 14H6c0 12 4 18 12 19M48 14h10c0 12-4 18-12 19" {...line} />
      <rect x="28" y="40" width="8" height="9" {...paint('orange')} />
      <rect x="18" y="49" width="28" height="9" rx="3" {...paint('orange')} />
    </>
  ),
  gamepad: (
    <>
      <path
        d="M17 17h30c8 0 13 8 15 20 1 8-2 14-8 14-5 0-7-4-11-8H21c-4 4-6 8-11 8-6 0-9-6-8-14 2-12 7-20 15-20z"
        {...paint('purple')}
      />
      <path d="M20 26v10M15 31h10" {...line} stroke="var(--echo-white)" />
      <circle cx="42" cy="28" r="3" {...paint('red')} />
      <circle cx="48" cy="35" r="3" {...paint('yellow')} />
    </>
  ),
  play: (
    <>
      <rect x="5" y="9" width="54" height="46" rx="12" {...paint('red')} />
      <path d="M26 20l18 12-18 12z" {...paint('white')} />
    </>
  ),
  headset: (
    <>
      <path d="M11 36V30a21 21 0 0142 0v6" {...line} strokeWidth={6} />
      <rect x="6" y="32" width="14" height="22" rx="6" {...paint('pink')} />
      <rect x="44" y="32" width="14" height="22" rx="6" {...paint('pink')} />
      <path d="M51 54c0 5-6 6-14 6" {...line} />
    </>
  ),
  ban: (
    <>
      <circle cx="32" cy="32" r="24" {...paint('white')} />
      <circle cx="32" cy="32" r="24" {...paint('red')} fill="none" strokeWidth={8} />
      <path d="M16 48L48 16" {...paint('red')} strokeWidth={8} />
    </>
  ),
  warning: (
    <>
      <path d="M32 6l27 48H5z" {...paint('yellow')} />
      <path d="M32 22v17" {...line} strokeWidth={5} />
      <circle cx="32" cy="46" r="3" {...paint('ink')} />
    </>
  ),
  check: (
    <>
      <circle cx="32" cy="32" r="26" {...paint('sky')} />
      <path d="M19 33l9 9 18-20" {...line} stroke="var(--echo-white)" strokeWidth={7} />
    </>
  ),
  coffee: (
    <>
      <path d="M44 22h6a8 8 0 010 18h-6" {...line} strokeWidth={5} />
      <path d="M8 18h38v20c0 10-7 17-19 17S8 48 8 38z" {...paint('white')} />
      <path d="M8 18h38v8H8z" {...paint('wood')} />
      <path d="M20 4c-3 4 3 6 0 10M30 4c-3 4 3 6 0 10" {...line} />
    </>
  ),
  calendar: (
    <>
      <rect x="6" y="10" width="52" height="48" rx="8" {...paint('white')} />
      <path d="M6 18a8 8 0 018-8h36a8 8 0 018 8v8H6z" {...paint('red')} />
      <path d="M20 4v12M44 4v12" {...line} strokeWidth={5} />
      <circle cx="20" cy="38" r="3" {...paint('ink')} />
      <circle cx="32" cy="38" r="3" {...paint('ink')} />
      <circle cx="44" cy="38" r="3" {...paint('ink')} />
      <circle cx="20" cy="48" r="3" {...paint('ink')} />
      <circle cx="32" cy="48" r="3" {...paint('ink')} />
    </>
  ),
}
