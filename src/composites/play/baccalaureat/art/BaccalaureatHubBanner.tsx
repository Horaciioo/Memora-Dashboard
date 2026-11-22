import { BacLetter, BacSheet } from '@/composites/play/baccalaureat/art/bacSheet'
import { BAC_BANNER } from '@/declarations/play/baccalaureat/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'bac-hub'
const { categories, rows, crossed, header, columnStart, columnStep, cycle, write } = BAC_BANNER
const DUR = `${cycle}s`
const WORD_WIDTH = columnStep - 20
// Pen slots: every word, then the strike, then the fix
const SLOTS = rows.length * categories.length + 2

/**
 * Cycle fraction where a pen slot starts, the last tenth erases the sheet
 * @param {number} slot - Slot index
 * @return {number} - Fraction
 */

const at = (slot: number) => Number(((slot / SLOTS) * 0.82).toFixed(4))
const SPAN = Number(((write / cycle) * 1).toFixed(4))

/**
 * Wipe revealing a word left to right like a pen stroke
 * @param {object} props - Clip id, place and slot
 * @return {JSX.Element}
 */

const Wipe = ({ id, x, y, slot }: { id: string; x: number; y: number; slot: number }) => (
  <clipPath id={id}>
    <rect x={x - 6} y={y - 40} height="56" width="0">
      <animate
        attributeName="width"
        dur={DUR}
        repeatCount="indefinite"
        values={`0;0;${WORD_WIDTH};${WORD_WIDTH};0`}
        keyTimes={`0;${at(slot)};${(at(slot) + SPAN).toFixed(4)};0.94;1`}
      />
    </rect>
  </clipPath>
)

/**
 * Hub ground of Baccalauréat: an exam sheet the round fills in by hand, one slip crossed out
 * @return {JSX.Element}
 */

export const BaccalaureatHubBanner = () => {
  const columnX = (column: number) => columnStart + column * columnStep
  const strikeSlot = rows.length * categories.length
  const target = rows[crossed.row]

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={PLAY_HUB.groundArt}
      aria-hidden="true"
    >
      <defs>
        {rows.map((row, rowIndex) =>
          row.words.map((word, column) => (
            <Wipe
              key={word}
              id={`${ID}-${rowIndex}-${column}`}
              x={columnX(column)}
              y={row.y}
              slot={rowIndex * categories.length + column}
            />
          ))
        )}
        <Wipe
          id={`${ID}-fix`}
          x={columnX(crossed.column)}
          y={target.y + 52}
          slot={strikeSlot + 1}
        />
      </defs>
      <BacSheet width={1600} height={900} />

      <g
        style={{ fill: 'var(--play-baccalaureat-deep)', fontFamily: 'var(--font-hand)' }}
        fontSize="30"
        fontWeight="700"
      >
        {categories.map((category, column) => (
          <g key={category}>
            <text x={columnX(column)} y={header}>
              {category}
            </text>
            <path
              d={`M${columnX(column)} ${header + 10}h${category.length * 15}`}
              style={{ stroke: 'var(--play-baccalaureat-deep)' }}
              strokeWidth="2"
            />
          </g>
        ))}
      </g>

      {rows.map((row, rowIndex) => (
        <g key={row.letter}>
          <BacLetter x={BAC_BANNER.margin / 2} y={row.y} letter={row.letter} size={64} />
          <g
            style={{ fill: 'var(--play-baccalaureat-ink)', fontFamily: 'var(--font-hand)' }}
            fontSize="36"
          >
            {row.words.map((word, column) => (
              <text
                key={word}
                x={columnX(column)}
                y={row.y}
                clipPath={`url(#${ID}-${rowIndex}-${column})`}
                transform={`rotate(-1.5 ${columnX(column)} ${row.y})`}
              >
                {word}
              </text>
            ))}
          </g>
        </g>
      ))}

      {/* Slip crossed out, the right word written under it */}
      <path
        d={`M${columnX(crossed.column) - 4} ${target.y - 10}c40 -6 80 4 ${WORD_WIDTH - 110} -4`}
        pathLength="100"
        fill="none"
        style={{ stroke: 'var(--bac-margin)' }}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="100 100"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur={DUR}
          repeatCount="indefinite"
          values="100;100;0;0;100"
          keyTimes={`0;${at(strikeSlot)};${(at(strikeSlot) + SPAN / 2).toFixed(4)};0.94;1`}
        />
      </path>
      <text
        x={columnX(crossed.column)}
        y={target.y + 52}
        fontSize="36"
        clipPath={`url(#${ID}-fix)`}
        style={{ fill: 'var(--play-baccalaureat-ink)', fontFamily: 'var(--font-hand)' }}
      >
        {crossed.fix}
      </text>
    </svg>
  )
}
