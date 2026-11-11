'use client'

import { PlayCountdown } from '@/composites/play/baccalaureat/PlayCountdown'
import { secondsTo } from '@/composites/play/baccalaureat/types'
import { useServerNow } from '@/core/hooks/interaction/state/time/useServerNow'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { navalMapTitle } from '@/declarations/play/naval/maps'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { PlayGames } from '@/utils/constants/play'

/**
 * Count before the first shot of a match, nothing once it has begun
 * @param {Object} props - Count
 * @param {number} props.startsAt - First shot, server milliseconds
 * @param {number} props.serverTime - Server time of the board
 * @param {string} props.map - Map fought on, named during the count
 * @return {JSX.Element | null}
 */

export const NavalStartCountdown = ({
  startsAt,
  serverTime,
  map,
}: {
  startsAt: number
  serverTime: number
  map: string
}) => {
  const now = useServerNow(new Date(serverTime))
  const seconds = secondsTo(new Date(startsAt), now)
  if (seconds <= 0) return null

  return (
    <PlayCountdown
      game={PlayGames.Naval}
      seconds={seconds}
      total={Math.max(NAVAL_SETTINGS.countdownSeconds, seconds)}
      lead={`${NAVAL_BOARD_COPY.starting} · ${navalMapTitle(map)}`}
    />
  )
}
