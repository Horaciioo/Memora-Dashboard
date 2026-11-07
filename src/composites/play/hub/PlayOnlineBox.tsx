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
 * @param {string} [props.className] - Box style
 * @return {JSX.Element}
 */

export const PlayOnlineBox = ({
  tables,
  className,
}: {
  tables: PlayLobbyCard[]
  className?: string
}) => (
  <section className={cn(PLAY_LIVE.box, className)} aria-label={PLAY_MOBILE_COPY.online}>
    <header className={PLAY_LIVE.head}>
      <h2 className={PLAY_LIVE.title}>{PLAY_MOBILE_COPY.online}</h2>
    </header>
    <PlayOnlineList tables={tables} />
  </section>
)
