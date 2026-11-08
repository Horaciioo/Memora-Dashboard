'use client'

import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { GolfPowerOrb } from '@/composites/play/golf/GolfPowerOrb'
import type { GolfFace } from '@/composites/play/golf/types'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { activeList } from '@/core/lib/play/golf'
import type { GolfActiveEntry, GolfBoardState } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Most dots drawn for shots or lives
const MAX_DOTS = 5

/**
 * Share of time left, null without a known length
 * @param {GolfActiveEntry} entry - Entry
 * @param {number} now - Server ms
 * @return {number | null} - Zero to one
 */

const leftOf = (entry: GolfActiveEntry, now: number): number | null =>
  entry.until === undefined || entry.at <= 0 || entry.until <= entry.at
    ? null
    : Math.min(1, Math.max(0, (entry.until - now) / (entry.until - entry.at)))

/**
 * One power acting
 * @param {Object} props - Entry and caster
 * @return {JSX.Element}
 */

const ActiveItem = ({
  entry,
  caster,
  now,
}: {
  entry: GolfActiveEntry
  caster: GolfFace | undefined
  now: number
}) => {
  const meta = GOLF_POWERS.get(entry.power)
  const left = entry.state === 'active' ? leftOf(entry, now) : null
  const count = Math.min(MAX_DOTS, entry.shots ?? entry.lives ?? 0)
  const tag =
    entry.state === 'armed'
      ? GOLF_BOARD_COPY.activeArmed
      : entry.state === 'queued'
        ? GOLF_BOARD_COPY.activeQueued
        : null
  const tip = caster
    ? fillPlayMessage(GOLF_BOARD_COPY.activeBy, { power: meta.label, name: caster.name })
    : meta.label

  return (
    <li
      className={cn(
        GOLF_BOARD.activeItem,
        meta.isBonus ? GOLF_BOARD.activeBonus : GOLF_BOARD.activeMalus,
        tag && GOLF_BOARD.activeWaiting
      )}
      style={{ '--seat': `var(--play-${caster?.color ?? 'ink'})` } as CSSProperties}
      tabIndex={0}
      aria-label={tip}
    >
      <GolfPowerOrb power={entry.power} className={GOLF_BOARD.activeOrb} />
      {left !== null && (
        <span className={GOLF_BOARD.activeRing} style={{ '--left': left } as CSSProperties} />
      )}
      {caster && (
        <Avatar
          name={caster.name}
          src={caster.avatarUrl}
          size="xs"
          title=""
          className={GOLF_BOARD.activeCaster}
        />
      )}
      {count > 0 && (
        <span className={GOLF_BOARD.activeDots} aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <span key={index} className={GOLF_BOARD.activeDot} />
          ))}
        </span>
      )}
      {tag && <span className={GOLF_BOARD.activeTag}>{tag}</span>}
      <span className={GOLF_BOARD.activeTip} role="tooltip">
        {entry.isMap ? `${tip} · ${GOLF_BOARD_COPY.activeMap}` : tip}
      </span>
    </li>
  )
}

/**
 * Powers acting on the viewer's ball and on the map, caster photo on each
 * @param {Object} props - Board and players
 * @param {GolfBoardState} props.board - Board
 * @param {GolfFace[]} props.faces - Players
 * @param {string} props.viewerId - Own or watched ball
 * @return {JSX.Element | null}
 */

export const GolfActiveStack = ({
  board,
  faces,
  viewerId,
}: {
  board: GolfBoardState
  faces: GolfFace[]
  viewerId: string
}) => {
  const now = useServerNow(new Date(board.serverTime))
  const entries = activeList(board, viewerId, now)
  if (entries.length === 0) return null

  return (
    <ul className={GOLF_BOARD.activeStack} aria-label={GOLF_BOARD_COPY.onYou}>
      {entries.map((entry) => (
        <ActiveItem
          key={entry.key}
          entry={entry}
          caster={faces.find((face) => face.accountId === entry.fromId)}
          now={now}
        />
      ))}
    </ul>
  )
}
