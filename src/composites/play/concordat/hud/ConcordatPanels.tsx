'use client'

import { useMemo } from 'react'

import {
  CONCORDAT_STANDING_COLUMNS,
  compactFigure,
  troopFigure,
  landShareText,
  playerRgb,
  rgbText,
  standingRowsOf,
} from '@/core/lib/play/concordat'
import type {
  ConcordatClientState,
  ConcordatStandingColumn,
  ConcordatStandingRow,
} from '@/core/lib/play/concordat'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_STANDINGS_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { fillPlayMessage } from '@/declarations/play/copy'
import { ICONS } from '@/declarations/ui/icons'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Rows seen at once before the list scrolls, the player's own row hangs below beyond them
const WINDOW_ROWS = 5
// Nations listed at most, the rest only through the sort
const LIST_LIMIT = 60
// Track widths of the fixed columns
const RANK_WIDTH = '1.5rem'
const NAME_WIDTH = 'minmax(6.5rem, 9rem)'
const CELL_WIDTH = 'minmax(2.6rem, auto)'

// Colour of a figure: land green, gold gold, troops red
const COLUMN_TONES: Partial<Record<ConcordatStandingColumn, string>> = {
  tiles: 'var(--concordat-ok)',
  gold: 'var(--concordat-gold)',
  income: 'var(--concordat-gold)',
  troops: 'var(--concordat-war)',
  maxTroops: 'var(--concordat-war-faint)',
  trade: 'var(--concordat-trade)',
}

export interface ConcordatPanelsProps {
  client: ConcordatClientState
  names: string[]
  land: number
}

// Text of a figure in its column
const figureText = (column: ConcordatStandingColumn, value: number): string => {
  if (column === 'tiles') return `${landShareText(value, 100)} %`
  if (column === 'income')
    return `${value > 0 ? '+' : value < 0 ? '-' : ''}${compactFigure(Math.abs(value))}`
  if (column === 'troops' || column === 'maxTroops') return troopFigure(value)
  if (column === 'gold' || column === 'trade') return compactFigure(value)
  if (column === 'kind')
    return value === 0 ? CONCORDAT_STANDINGS_COPY.kindHuman : CONCORDAT_STANDINGS_COPY.kindCountry

  return String(value)
}

// Hint of a header, the long name when the short one is cut
const hintOf = (column: ConcordatStandingColumn): string => {
  const key =
    `hint${column[0].toUpperCase()}${column.slice(1)}` as keyof typeof CONCORDAT_STANDINGS_COPY

  return CONCORDAT_STANDINGS_COPY[key] ?? CONCORDAT_STANDINGS_COPY[column]
}

/**
 * Standings sidebar of the top left: a key row, then a sortable table of the living nations
 * with the own row pinned below the window when it ranks lower
 * @param {ConcordatPanelsProps} props - Game
 * @return {JSX.Element | null}
 */

export const ConcordatPanels = ({ client, names, land }: ConcordatPanelsProps) => {
  const sort = useConcordatViewStore((state) => state.standSort)
  const isDesc = useConcordatViewStore((state) => state.standDesc)
  const columns = useConcordatViewStore((state) => state.standColumns)
  const sortStandings = useConcordatViewStore((state) => state.sortStandings)
  const jumpTo = useConcordatViewStore((state) => state.jumpTo)
  const ArrowIcon = ICONS.expand

  // Refreshed every second, the sort is cheap but the eye needs no more
  const second = Math.floor(client.tick / CONCORDAT_TICKS_PER_SECOND)
  const rows = useMemo(
    () => standingRowsOf(client, land, sort, isDesc),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client.players, client.systems, land, sort, isDesc, second]
  )
  const shown = columns.length ? CONCORDAT_STANDING_COLUMNS.filter((c) => columns.includes(c)) : []
  const ownIndex = rows.findIndex((row) => row.isMine)
  const isPinned = ownIndex >= WINDOW_ROWS
  const template = `${RANK_WIDTH} ${NAME_WIDTH} ${shown.map(() => CELL_WIDTH).join(' ')}`

  const line = (row: ConcordatStandingRow, index: number) => {
    const player = client.players[row.id - 1]
    const rgb = playerRgb(player, CONCORDAT_ART.nation)

    return (
      <li
        key={row.id}
        className={cn(CONCORDAT_HUD.standRow, row.isMine && CONCORDAT_HUD.standMine)}
        style={{ gridTemplateColumns: template }}
        title={fillPlayMessage(CONCORDAT_STANDINGS_COPY.goTo, { name: names[row.id] })}
        onClick={() => jumpTo(Math.max(player.capital, player.start))}
      >
        <span className="text-[var(--play-ink-faint)]">{index + 1}</span>
        <span className={CONCORDAT_HUD.standName}>
          <span className={CONCORDAT_HUD.swatch} style={{ background: rgbText(rgb) }} />
          <span className="truncate">{names[row.id]}</span>
        </span>
        {shown.map((column) => (
          <span
            key={column}
            className={CONCORDAT_HUD.standCell}
            style={{ color: COLUMN_TONES[column] }}
          >
            {figureText(column, row.figures[column])}
          </span>
        ))}
      </li>
    )
  }

  return (
    <div className={CONCORDAT_HUD.standings}>
      <div className={CONCORDAT_HUD.standTable}>
        <div className={CONCORDAT_HUD.standHead} style={{ gridTemplateColumns: template }}>
          <span>{CONCORDAT_STANDINGS_COPY.rank}</span>
          <span>{CONCORDAT_STANDINGS_COPY.name}</span>
          {shown.map((column) => (
            <button
              key={column}
              type="button"
              className={CONCORDAT_HUD.standSortKey}
              title={hintOf(column)}
              onClick={() => sortStandings(column)}
            >
              {CONCORDAT_STANDINGS_COPY[column]}
              {sort === column && (
                <ArrowIcon
                  className={cn('ml-0.5 inline size-3', !isDesc && 'rotate-180')}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
        <ol className={CONCORDAT_HUD.standScroll}>
          {rows.slice(0, LIST_LIMIT).map((row, index) => line(row, index))}
        </ol>
        {isPinned && (
          <ol className={CONCORDAT_HUD.standPinned}>{line(rows[ownIndex], ownIndex)}</ol>
        )}
      </div>
    </div>
  )
}
