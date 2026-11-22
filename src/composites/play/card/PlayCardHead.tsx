'use client'

import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { presenceSentence } from '@/composites/play/mobile/presenceSentence'
import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { PlayPlaceStates, readPlayPlace } from '@/core/lib/play/presenceState'
import { fillPlayMessage, PLAY_CARD_COPY, PLAY_PROFILE_COPY, tierOf } from '@/declarations/play'
import { PLAY_CARD } from '@/declarations/ui/variants'
import type { PlayCardView } from '@/types/play'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/time/dates'

/**
 * Portrait, name, level and what the player does now
 * @param {Object} props - Head
 * @param {PlayCardView} props.card - Player
 * @return {JSX.Element}
 */

export const PlayCardHead = ({ card }: { card: PlayCardView }) => {
  const online = usePlayOnline().find((member) => member.accountId === card.accountId)
  const isOnline = Boolean(online) || Boolean(card.presence)
  const place = readPlayPlace(online?.place ?? null)
  const sentence = presenceSentence(
    card.presence ? PlayPlaceStates.Playing : place?.state,
    card.presence?.game ?? null
  )
  const offline = card.lastSeenAt
    ? fillPlayMessage(PLAY_PROFILE_COPY.seen, { since: formatSince(card.lastSeenAt) })
    : PLAY_PROFILE_COPY.offline

  return (
    <header className={PLAY_CARD.head}>
      <LevelFrame level={card.level.level} name={card.name} src={card.avatarUrl} size="xl" />
      <div className={PLAY_CARD.who}>
        <h2 className={PLAY_CARD.name}>{card.name}</h2>
        <span className={PLAY_CARD.tier}>{tierOf(card.level.level).tier.label}</span>
        <p className={PLAY_CARD.level}>
          {[
            fillPlayMessage(PLAY_CARD_COPY.level, { level: card.level.level }),
            fillPlayMessage(PLAY_CARD_COPY.xp, { xp: card.xp.toLocaleString('fr-FR') }),
          ].join(' · ')}
        </p>
        <p className={cn(PLAY_CARD.presence, isOnline && PLAY_CARD.presenceOn)}>
          {isOnline ? sentence : offline}
        </p>
      </div>
    </header>
  )
}
