'use client'

import { useRouter } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayRelationKey } from '@/composites/play/friends/PlayRelationKey'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_CARD_COPY, PLAY_FRIENDS_COPY } from '@/declarations/play'
import { PLAY_CARD } from '@/declarations/ui/variants'
import type { PlayCardView } from '@/types/play'
import { Permissions } from '@/utils/constants/permissions'
import { PlayStatuses } from '@/utils/constants/play'

// Keys of the card, the main one filled
const KEYS = { base: PLAY_CARD.keyGhost, main: PLAY_CARD.key }

/**
 * Keys under the card: friendship, join or watch, profile
 * @param {Object} props - Actions
 * @param {PlayCardView} props.card - Player
 * @param {() => void} props.onClose - Close the card
 * @return {JSX.Element}
 */

export const PlayCardActions = ({ card, onClose }: { card: PlayCardView; onClose: () => void }) => {
  const router = useRouter()
  const moves = usePlayMoves()
  const { can } = useAuthContext()
  const isSelf = card.relation === 'self'
  const seat = card.presence
  const isFriend = card.relation === 'friend'
  // A tie to answer comes before the profile
  const isAsking = card.relation === 'none' || card.relation === 'incoming'
  const relationKey = (
    <PlayRelationKey
      accountId={card.accountId}
      relation={card.relation}
      requestId={card.requestId}
      styles={KEYS}
    />
  )

  return (
    <div className={PLAY_CARD.actions}>
      {seat?.status === PlayStatuses.Lobby && !isSelf && (
        <button
          type="button"
          className={PLAY_CARD.key}
          disabled={moves.isSaving}
          onClick={() => void moves.join(seat.sessionId).then(onClose)}
        >
          {PLAY_FRIENDS_COPY.join}
        </button>
      )}
      {seat?.status === PlayStatuses.Running && !isSelf && (
        <button
          type="button"
          className={PLAY_CARD.keyGhost}
          onClick={() => {
            onClose()
            router.push(ROUTES.playSession(seat.sessionId))
          }}
        >
          {PLAY_FRIENDS_COPY.watch}
        </button>
      )}
      {!isFriend && relationKey}
      <AppLink
        href={isSelf ? ROUTES.playStats : ROUTES.playPlayer(card.accountId)}
        onClick={onClose}
        className={isAsking ? PLAY_CARD.keyGhost : PLAY_CARD.key}
      >
        {isSelf ? PLAY_CARD_COPY.myStats : PLAY_CARD_COPY.profile}
      </AppLink>
      {can(Permissions.PlayManage) && (
        <AppLink
          href={ROUTES.playAdminPlayer(card.accountId)}
          onClick={onClose}
          className={PLAY_CARD.keyGhost}
        >
          {PLAY_CARD_COPY.admin}
        </AppLink>
      )}
      {isFriend && relationKey}
    </div>
  )
}
