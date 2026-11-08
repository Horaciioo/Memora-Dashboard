'use client'

import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayInviteSentence } from '@/composites/play/invites/PlayInviteSentence'
import { usePlayNoticeAnswer } from '@/core/hooks/data/play/usePlayNoticeAnswer'
import { useBellSpot } from '@/core/hooks/interaction/layout/measure/useBellSpot'
import { noticeLabels } from '@/core/lib/play/notices'
import { playKeysOf } from '@/declarations/play/games'
import { PLAY_INVITE_COPY, PLAY_INVITE_SETTINGS } from '@/declarations/play/invites'
import { PLAY_INVITE_CALL } from '@/declarations/ui/variants'
import type { PlayNoticeView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Invitation springing from the notifications bell, accept to go straight to the game
 * @param {Object} props - Bubble
 * @param {PlayNoticeView} props.invite - Invitation
 * @param {string} [props.beacon] - Key aimed at, the bell by default
 * @param {string} [props.className] - Extra classes
 * @return {JSX.Element | null}
 */

export const PlayInviteBubble = ({
  invite,
  beacon,
  className,
}: {
  invite: PlayNoticeView
  beacon?: string
  className?: string
}) => {
  const spot = useBellSpot(true, beacon)
  const { isSaving, accept, decline } = usePlayNoticeAnswer(invite)
  const labels = noticeLabels(invite)
  // Without a bell on screen (fullscreen game), pinned top centre
  const place: Record<string, string | number> = spot
    ? {
        left: spot.left,
        [spot.isAbove ? 'bottom' : 'top']: spot.edge,
        '--origin': `${spot.tail}px ${spot.isAbove ? '100%' : '0%'}`,
      }
    : { top: PLAY_INVITE_SETTINGS.gapPx, left: '50%', translate: '-50% 0', '--origin': '50% 0%' }

  return (
    <aside
      key={invite.id}
      className={cn(PLAY_INVITE_CALL.anchor, className)}
      style={{ ...place, ...playKeysOf(invite.game) } as CSSProperties}
      aria-label={PLAY_INVITE_COPY.label}
      role="alertdialog"
    >
      <div className={PLAY_INVITE_CALL.card}>
        {spot && (
          <span
            className={spot.isAbove ? PLAY_INVITE_CALL.tailBelow : PLAY_INVITE_CALL.tailAbove}
            style={{ '--tail': `${spot.tail}px` } as CSSProperties}
            aria-hidden="true"
          />
        )}
        <PlayGameLogo game={invite.game} className={PLAY_INVITE_CALL.logo} />
        <div className={PLAY_INVITE_CALL.body}>
          <span className={PLAY_INVITE_CALL.eyebrow}>{PLAY_INVITE_COPY.eyebrow}</span>
          <p className={PLAY_INVITE_CALL.text}>
            <PlayInviteSentence notice={invite} nameClassName={PLAY_INVITE_CALL.name} />
          </p>
          <div className={PLAY_INVITE_CALL.actions}>
            <Button variant="arcadeSmall" isLoading={isSaving} onClick={() => void accept()}>
              {labels.accept}
            </Button>
            <Button variant="arcadeGhostSmall" disabled={isSaving} onClick={decline}>
              {labels.decline}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
