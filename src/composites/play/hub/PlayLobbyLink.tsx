'use client'

import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_ROOM } from '@/declarations/ui/variants'

/**
 * One tap copies the way into the game, the code when private
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
  const path = joinCode ? ROUTES.playJoinCode(joinCode) : ROUTES.playSession(sessionId)

  return (
    <button
      type="button"
      className={PLAY_ROOM.link}
      onClick={() => void copyLink(`${window.location.origin}${path}`)}
    >
      <span className={PLAY_ROOM.linkMain}>
        {joinCode ? (
          <span
            className={PLAY_ROOM.linkCode}
            aria-label={`${PLAY_HUB_COPY.codeLabel} ${joinCode}`}
          >
            {joinCode}
          </span>
        ) : (
          PLAY_HUB_COPY.linkTitle
        )}
      </span>
      <span className={PLAY_ROOM.linkCopy}>{PLAY_HUB_COPY.linkCopyShort}</span>
    </button>
  )
}
