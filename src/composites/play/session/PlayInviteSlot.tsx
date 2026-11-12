'use client'

import type { ReactNode } from 'react'

import { PlayInviteAnchor } from '@/composites/play/session/PlayInviteAnchor'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ROOM } from '@/declarations/ui/variants'
import type { PlayInviteCandidate } from '@/types/play'

/**
 * Empty seat card, one tap opens the picker under it
 * @param {Object} props - Game and candidates
 * @param {string} props.sessionId - Game
 * @param {PlayInviteCandidate[]} props.candidates - Members to call
 * @param {ReactNode} [props.extras] - Lobby tools in the panel
 * @param {boolean} [props.isOpenAtStart] - Picker open on arrival
 * @return {JSX.Element}
 */

export const PlayInviteSlot = ({
  sessionId,
  candidates,
  extras,
  isOpenAtStart,
}: {
  sessionId: string
  candidates: PlayInviteCandidate[]
  extras?: ReactNode
  isOpenAtStart?: boolean
}) => {
  const AddIcon = ICONS.playAdd

  return (
    <PlayInviteAnchor
      sessionId={sessionId}
      candidates={candidates}
      canSeat
      centered
      className="flex"
      extras={extras}
      isOpenAtStart={isOpenAtStart}
      trigger={(toggle, isOpen) => (
        <button type="button" aria-expanded={isOpen} className={PLAY_ROOM.slot} onClick={toggle}>
          <span className={PLAY_ROOM.slotIcon}>
            <AddIcon className={PLAY_ROOM.slotIconSvg} aria-hidden="true" />
          </span>
          <span className={PLAY_ROOM.slotLabel}>{PLAY_HUB_COPY.slotFree}</span>
        </button>
      )}
    />
  )
}
