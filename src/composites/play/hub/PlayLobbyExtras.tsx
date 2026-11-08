'use client'

import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { botLevelsOf, PLAY_BOT_COPY, PLAY_BOT_LEVEL_LABELS } from '@/declarations/play/bots'
import { PLAY_INVITE } from '@/declarations/ui/variants'
import { PlayBotKinds } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Host seats bots from the seat picker, one tap per level
 * @param {Object} props - Game
 * @param {string} props.sessionId - Game
 * @param {PlayGameName} props.game - Game kind
 * @return {JSX.Element}
 */

export const PlayLobbyExtras = ({ sessionId, game }: { sessionId: string; game: PlayGameName }) => {
  const moves = usePlayMoves()
  const levels = botLevelsOf(game)
  const fillLevel = levels.includes(PlayBotKinds.Medium) ? PlayBotKinds.Medium : levels[0]

  return (
    <div className={PLAY_INVITE.footGroup}>
      <h3 className={PLAY_INVITE.sectionTitle}>{PLAY_HUB_COPY.botsTitle}</h3>
      <div className={PLAY_INVITE.choice} role="group" aria-label={PLAY_BOT_COPY.add}>
        <span className={PLAY_INVITE.choiceText}>{PLAY_HUB_COPY.botsAdd}</span>
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            disabled={moves.isSaving}
            className={PLAY_INVITE.level}
            onClick={() => void moves.bots(sessionId, level)}
          >
            {levels.length > 1 ? PLAY_BOT_LEVEL_LABELS[level] : PLAY_BOT_COPY.badge}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={PLAY_INVITE.choice}
        disabled={moves.isSaving}
        onClick={() => void moves.bots(sessionId, fillLevel, true)}
      >
        {PLAY_HUB_COPY.botsFill}
      </button>
    </div>
  )
}
