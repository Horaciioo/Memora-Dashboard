'use client'

import { Button } from '@/components/elements/actions/Button'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ROOM } from '@/declarations/ui/variants'

/**
 * One tap copies the way into the game: a share card with the code when private, a quiet row when public
 * @param {Object} props - Game
 * @param {string} props.sessionId - Game
 * @param {string | null} props.joinCode - Code of a private game
 * @return {JSX.Element}
 */

export const PlayLobbyLink = ({
  sessionId,
  joinCode,
}: {
  sessionId: string
  joinCode: string | null
}) => {
  const copyLink = useCopy(PLAY_HUB_COPY.linkCopied)
  const CopyIcon = ICONS.copy
  const path = joinCode ? ROUTES.playJoinCode(joinCode) : ROUTES.playSession(sessionId)
  const copy = () => void copyLink(`${window.location.origin}${path}`)

  if (!joinCode) {
    return (
      <button type="button" className={PLAY_ROOM.link} onClick={copy}>
        <span className={PLAY_ROOM.linkMain}>{PLAY_HUB_COPY.linkTitle}</span>
        <span className={PLAY_ROOM.linkCopy}>{PLAY_HUB_COPY.linkCopyShort}</span>
      </button>
    )
  }

  return (
    <div className={PLAY_ROOM.share}>
      <div className={PLAY_ROOM.shareText}>
        <p className={PLAY_ROOM.shareLabel}>{PLAY_HUB_COPY.shareCode}</p>
        <p className={PLAY_ROOM.shareCode} aria-label={`${PLAY_HUB_COPY.codeLabel} ${joinCode}`}>
          {joinCode}
        </p>
      </div>
      <Button variant="arcadeHero" onClick={copy}>
        <CopyIcon className="size-5" aria-hidden="true" />
        {PLAY_HUB_COPY.copyLink}
      </Button>
    </div>
  )
}
