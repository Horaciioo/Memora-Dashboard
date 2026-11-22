import { JUMBLE_BANNER } from '@/declarations/play/jumble/banner'

/**
 * Metal gradient of the lead sorts
 * @param {object} props - Id prefix
 * @return {JSX.Element}
 */

export const JumbleDefs = ({ id }: { id: string }) => (
  <>
    <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style={{ stopColor: 'var(--jumble-metal)' }} />
      <stop offset="0.55" style={{ stopColor: 'var(--jumble-metal-deep)' }} />
      <stop offset="1" style={{ stopColor: 'var(--jumble-metal)' }} />
    </linearGradient>
    <linearGradient id={`${id}-grain`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" style={{ stopColor: 'var(--jumble-wood)' }} />
      <stop offset="0.5" style={{ stopColor: 'var(--jumble-wood-lit)' }} />
      <stop offset="1" style={{ stopColor: 'var(--jumble-wood)' }} />
    </linearGradient>
  </>
)

/**
 * Wooden type case: rows of compartments, loose sorts in some
 * @param {object} props - Id prefix, size and sort size
 * @return {JSX.Element}
 */

export const JumbleCase = ({
  id,
  width,
  height,
  sortSize,
}: {
  id: string
  width: number
  height: number
  sortSize: number
}) => {
  const rowHeight = height / JUMBLE_BANNER.caseRows.length
  const wall = Math.max(4, width / 160)
  let letter = 0

  return (
    <g>
      <rect width={width} height={height} style={{ fill: 'var(--jumble-wood-deep)' }} />
      {JUMBLE_BANNER.caseRows.map((columns, row) =>
        Array.from({ length: columns }, (_, column) => {
          const cell = width / columns
          const x = column * cell + wall
          const y = row * rowHeight + wall
          const hasSort = (row * 3 + column) % 4 === 1
          const char = JUMBLE_BANNER.loose[letter++ % JUMBLE_BANNER.loose.length]

          return (
            <g key={`${row}-${column}`}>
              <rect
                x={x}
                y={y}
                width={cell - wall * 2}
                height={rowHeight - wall * 2}
                rx={wall}
                fill={`url(#${id}-grain)`}
                opacity="0.55"
              />
              <rect
                x={x}
                y={y}
                width={cell - wall * 2}
                height={wall * 1.5}
                style={{ fill: 'var(--jumble-wood-deep)' }}
                opacity="0.6"
              />
              {hasSort && (
                <g
                  transform={`translate(${x + cell / 2 - wall} ${y + rowHeight / 2}) rotate(${((row + column) % 3) * 9 - 9})`}
                  opacity="0.7"
                >
                  <JumbleSort id={id} letter={char} size={sortSize} />
                </g>
              )}
            </g>
          )
        })
      )}
    </g>
  )
}

/**
 * Lead sort seen from its face: metal body, nick, raised letter
 * @param {object} props - Id prefix, letter and size
 * @return {JSX.Element}
 */

export const JumbleSort = ({ id, letter, size }: { id: string; letter: string; size: number }) => (
  <g>
    <rect
      x={-size / 2}
      y={-size / 2 + size * 0.12}
      width={size}
      height={size}
      rx={size * 0.08}
      style={{ fill: 'var(--jumble-metal-deep)' }}
    />
    <rect
      x={-size / 2}
      y={-size / 2}
      width={size}
      height={size}
      rx={size * 0.08}
      fill={`url(#${id}-metal)`}
    />
    <rect
      x={-size / 2}
      y={size * 0.34}
      width={size}
      height={size * 0.06}
      style={{ fill: 'var(--jumble-metal-deep)' }}
      opacity="0.7"
    />
    <text
      y={size * 0.26}
      textAnchor="middle"
      fontSize={size * 0.72}
      fontWeight="900"
      style={{ fill: 'var(--jumble-metal-ink)', fontFamily: 'Georgia, serif' }}
    >
      {letter}
    </text>
  </g>
)
