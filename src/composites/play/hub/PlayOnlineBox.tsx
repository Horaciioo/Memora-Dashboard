'use client'

import { PlayOnlineList } from '@/composites/play/mobile/PlayOnlineList'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_LIVE } from '@/declarations/ui/variants'
import type { PlayLobbyCard } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Box of the players in Play, under the live tables
 * @param {Object} props - Box
 * @param {PlayLobbyCard[]} props.tables - Open and running tables
 * @param {boolean} [props.isFlat] - Inside a scroll box, no box nor title
 * @param {string} [props.className] - Box style
 * @return {JSX.Element}
 */

export const PlayOnlineBox = ({
  tables,
  isFlat,
  className,
}: {
  tables: PlayLobbyCard[]
  isFlat?: boolean
  className?: string
}) => (
  <section
    className={cn(isFlat ? PLAY_LIVE.flat : PLAY_LIVE.box, className)}
    aria-label={PLAY_MOBILE_COPY.online}
  >
    {!isFlat && (
      <header className={PLAY_LIVE.head}>
        <h2 className={PLAY_LIVE.title}>{PLAY_MOBILE_COPY.online}</h2>
      </header>
    )}
    <PlayOnlineList tables={tables} />
  </section>
)
