'use client'

import { PlayInviteAnchor } from '@/composites/play/session/PlayInviteAnchor'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayCandidate } from '@/types/play'

/**
 * Dashed empty seat that invites someone
 * @param {Object} props - Game and candidates
 * @param {string} props.sessionId - Game
 * @param {PlayCandidate[]} props.candidates - Members to call
 * @return {JSX.Element}
 */

export const PlayInviteSlot = ({
  sessionId,
  candidates,
}: {
  sessionId: string
  candidates: PlayCandidate[]
}) => {
  const AddIcon = ICONS.playAdd

  return (
    <PlayInviteAnchor
      sessionId={sessionId}
      candidates={candidates}
      canSeat
      inline
      trigger={(toggle, isOpen) => (
        <button
          type="button"
          aria-expanded={isOpen}
          className={PLAY_HUB.inviteSlot}
          onClick={toggle}
        >
          <span className={PLAY_HUB.inviteSlotIcon}>
            <AddIcon className={PLAY_HUB.backIcon} />
          </span>
          <span className={PLAY_HUB.seatName}>{PLAY_HUB_COPY.inviteSlot}</span>
        </button>
      )}
    />
  )
}
