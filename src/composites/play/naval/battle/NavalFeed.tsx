'use client'

import { useState } from 'react'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import type { PlayFeedLine } from '@/composites/play/session/PlaySessionFeed'
import { NavalCodes, strikesOf } from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalShotView } from '@/core/lib/play/naval/state'
import { NAVAL_FEED_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'

/**
 * Naval feed, a line per strike once it has landed
 * @param {Object} props - Feed
 * @param {NavalBoardState} props.board - Board
 * @param {NavalShotView[]} props.shown - Shots fully played
 * @param {number} props.match - Match on screen
 * @param {PlayFace[]} props.players - Faces by account
 * @return {JSX.Element}
 */

export const NavalFeed = ({
  board,
  shown,
  match,
  players,
}: {
  board: NavalBoardState
  shown: NavalShotView[]
  match: number
  players: PlayFace[]
}) => {
  // Moment each strike was first told
  const [told, setTold] = useState<Record<string, Date>>({})
  const strikes = strikesOf(shown.filter((shot) => shot.match === match))
  // Strikes told since the last render are stamped now
  const missing = strikes.filter(({ match: m, rev }) => !told[`${m}:${rev}`])
  if (missing.length) {
    const now = new Date()
    setTold({
      ...told,
      ...Object.fromEntries(missing.map(({ match: m, rev }) => [`${m}:${rev}`, now])),
    })
  }
  const feed: PlayFeedLine[] = strikes
    .map((strike) => {
      const id = `${strike.match}:${strike.rev}`
      const kind = strike.cells.some((cell) => cell.code === NavalCodes.Sunk)
        ? 'SUNK'
        : strike.cells.some((cell) => cell.code === NavalCodes.Hit)
          ? 'HIT'
          : 'MISS'

      return {
        id,
        kind,
        accountId: board.players[strike.shooter]?.accountId ?? null,
        at: told[id] ?? new Date(board.serverTime),
        values: { victimId: board.players[strike.target]?.accountId ?? '' },
      }
    })
    .toReversed()
    .slice(0, NAVAL_SETTINGS.feedSize)

  return <PlaySessionFeed feed={feed} copy={NAVAL_FEED_COPY} players={players} />
}
