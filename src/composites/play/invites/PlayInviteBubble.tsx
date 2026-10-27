'use client'

import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayInviteSentence } from '@/composites/play/invites/PlayInviteSentence'
import { usePlayInviteAnswer } from '@/core/hooks/data/play/usePlayInviteAnswer'
import { useBellSpot } from '@/core/hooks/interaction/layout/useBellSpot'
import { playKeysOf } from '@/declarations/play/games'
import { PLAY_INVITE_COPY } from '@/declarations/play/invites'
import { PLAY_INVITE_CALL } from '@/declarations/ui/variants'
import type { PlayInviteView } from '@/types/play'

/**
 * Invitation springing from the notifications bell, accept to go straight to the game
 * @param {Object} props - Bubble
 * @param {PlayInviteView} props.invite - Invitation
 * @return {JSX.Element | null}
 */

export const PlayInviteBubble = ({ invite }: { invite: PlayInviteView }) => {
  const spot = useBellSpot(true)
  const { isSaving, accept, decline } = usePlayInviteAnswer(invite)
  if (!spot) return null

  const place = {
    left: spot.left,
    [spot.isAbove ? 'bottom' : 'top']: spot.edge,
    '--origin': `${spot.tail}px ${spot.isAbove ? '100%' : '0%'}`,
  } as CSSProperties

  return (
    <aside
      key={invite.id}
      className={PLAY_INVITE_CALL.anchor}
      style={{ ...place, ...playKeysOf(invite.game) } as CSSProperties}
      aria-label={PLAY_INVITE_COPY.label}
      role="alertdialog"
    >
      <div className={PLAY_INVITE_CALL.card}>
        <span
          className={spot.isAbove ? PLAY_INVITE_CALL.tailBelow : PLAY_INVITE_CALL.tailAbove}
          style={{ '--tail': `${spot.tail}px` } as CSSProperties}
          aria-hidden="true"
        />
        <PlayGameLogo game={invite.game} className={PLAY_INVITE_CALL.logo} />
        <div className={PLAY_INVITE_CALL.body}>
          <span className={PLAY_INVITE_CALL.eyebrow}>{PLAY_INVITE_COPY.eyebrow}</span>
          <p className={PLAY_INVITE_CALL.text}>
            <PlayInviteSentence invite={invite} nameClassName={PLAY_INVITE_CALL.name} />
          </p>
          <div className={PLAY_INVITE_CALL.actions}>
            <Button variant="arcadeSmall" isLoading={isSaving} onClick={() => void accept()}>
              {PLAY_INVITE_COPY.accept}
            </Button>
            <Button variant="arcadeGhostSmall" disabled={isSaving} onClick={decline}>
              {PLAY_INVITE_COPY.decline}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
