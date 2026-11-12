'use client'

import { useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayCurrentGame } from '@/composites/play/brand/PlayCurrentGame'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayLeaveDialog } from '@/composites/play/mobile/PlayLeaveDialog'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { BUTTON_STYLES, PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Session row of the game the player sits in: logo, line, quit, resume
 * @param {Object} props - Row
 * @param {PlayPresence} props.presence - Current game
 * @return {JSX.Element}
 */

export const PlayResumeCallout = ({ presence }: { presence: PlayPresence }) => {
  const moves = usePlayMoves()
  const [isAsking, setAsking] = useState(false)

  return (
    <div className={PLAY_DOCK.resume}>
      <PlayGameLogo game={presence.game} className={PLAY_DOCK.resumeLogo} />
      <span className={PLAY_DOCK.resumeText}>
        <PlayCurrentGame game={presence.game} />
      </span>
      <div className={PLAY_DOCK.resumeActions}>
        <button
          type="button"
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeDangerSmall)}
          onClick={() => setAsking(true)}
        >
          {PLAY_HUB_COPY.leave}
        </button>
        <AppLink
          href={ROUTES.playSession(presence.sessionId)}
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeSmall)}
        >
          {PLAY_HUB_COPY.resume}
        </AppLink>
      </div>
      {isAsking && (
        <PlayLeaveDialog
          title={PLAY_MOBILE_COPY.gameLeaveTitle}
          text={PLAY_MOBILE_COPY.gameLeaveText}
          confirm={PLAY_MOBILE_COPY.gameLeaveConfirm}
          pending={moves.isSaving}
          onCancel={() => setAsking(false)}
          onConfirm={() => void moves.leave(presence.sessionId).then(() => setAsking(false))}
        />
      )}
    </div>
  )
}
