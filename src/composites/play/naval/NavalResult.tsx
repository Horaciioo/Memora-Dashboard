'use client'

import { useEffect } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { playNaval } from '@/composites/play/naval/sound'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { PlayPodium } from '@/composites/play/results/PlayPodium'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_RESULT } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Place in words
 * @param {number | null} place - Place
 * @return {string} - First, second...
 */

const placeLabel = (place: number | null): string =>
  place === 1
    ? NAVAL_BOARD_COPY.firstPlace
    : fillPlayMessage(NAVAL_BOARD_COPY.place, { place: place ?? '-' })

/**
 * Final ranking under confetti, the fanfare or the lament as it opens
 * @param {Object} props - Result
 * @param {NavalCaptainView[]} props.captains - Captains
 * @param {number} props.viewer - Seat of the viewer, minus one when watching
 * @param {(seat: number) => number} props.sunkBy - Ships sunk by a captain
 * @return {JSX.Element}
 */

export const NavalResult = ({
  captains,
  viewer,
  sunkBy,
}: {
  captains: NavalCaptainView[]
  viewer: number
  sunkBy: (seat: number) => number
}) => {
  const ranked = captains.toSorted(
    (a, b) =>
      Number(a.hasLeft) - Number(b.hasLeft) ||
      (a.place ?? Infinity) - (b.place ?? Infinity) ||
      sunkBy(b.index) - sunkBy(a.index)
  )
  const winner = ranked.find((captain) => captain.place === 1 && !captain.hasLeft)
  const isWinner = winner?.index === viewer

  // Fanfare or lament once, for those who played
  useEffect(() => {
    if (viewer < 0) return
    if (isWinner) playNaval('bell')
    else playNaval('sinking', 0.7)
  }, [viewer, isWinner])

  return (
    <div className={NAVAL_RESULT.root}>
      <h2 className={cn(NAVAL_RESULT.banner, isWinner && NAVAL_RESULT.bannerWin)}>
        {winner && viewer >= 0
          ? isWinner
            ? NAVAL_BOARD_COPY.victory
            : NAVAL_BOARD_COPY.defeat
          : winner
            ? fillPlayMessage(NAVAL_BOARD_COPY.wonBy, { name: winner.name })
            : NAVAL_BOARD_COPY.defeat}
      </h2>
      <PlayPodium
        hasWinner={Boolean(winner)}
        ranked={ranked.map((captain) => ({
          accountId: captain.accountId,
          name: captain.name,
          avatarUrl: captain.avatarUrl,
          note: captain.hasLeft
            ? NAVAL_BOARD_COPY.left
            : fillPlayMessage(NAVAL_BOARD_COPY.sunkNote, { count: sunkBy(captain.index) }),
        }))}
      />
      <div className={NAVAL_RESULT.list}>
        {ranked.map((captain) => (
          <div
            key={captain.accountId}
            className={cn(NAVAL_RESULT.row, captain.index === viewer && NAVAL_RESULT.rowMine)}
          >
            <span className={NAVAL_RESULT.rank}>{placeLabel(captain.place)}</span>
            <Avatar name={captain.name} src={captain.avatarUrl} size="xs" />
            <span className={NAVAL_RESULT.name}>{captain.name}</span>
            <span className={NAVAL_RESULT.note}>
              {captain.hasLeft
                ? NAVAL_BOARD_COPY.left
                : fillPlayMessage(NAVAL_BOARD_COPY.sunkNote, { count: sunkBy(captain.index) })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
