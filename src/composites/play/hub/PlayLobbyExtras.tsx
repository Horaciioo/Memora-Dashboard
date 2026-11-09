'use client'

import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { PLAY_HUB_COPY } from '@/declarations/play'
import {
  areBotsAwake,
  botLevelsOf,
  PLAY_BOT_COPY,
  PLAY_BOT_LEVEL_LABELS,
} from '@/declarations/play/bots'
import { PLAY_INVITE } from '@/declarations/ui/variants'
import { PlayBotKinds } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Host seats bots from the seat picker, greyed while bots sleep
 * @param {Object} props - Game
 * @param {string} props.sessionId - Game
 * @param {PlayGameName} props.game - Game kind
 * @return {JSX.Element}
 */

export const PlayLobbyExtras = ({ sessionId, game }: { sessionId: string; game: PlayGameName }) => {
  const moves = usePlayMoves()
  const levels = botLevelsOf(game)
  const fillLevel = levels.includes(PlayBotKinds.Medium) ? PlayBotKinds.Medium : levels[0]
  const isAsleep = !areBotsAwake(game)
  const isDisabled = isAsleep || moves.isSaving

  return (
    <div className={PLAY_INVITE.footGroup}>
      <h3 className={PLAY_INVITE.sectionTitle}>{PLAY_HUB_COPY.botsTitle}</h3>
      {isAsleep && <p className={PLAY_INVITE.pausedNote}>{PLAY_HUB_COPY.botsPaused}</p>}
      <div className={cn('flex flex-col', isAsleep && PLAY_INVITE.footPaused)}>
        <div className={PLAY_INVITE.choice} role="group" aria-label={PLAY_BOT_COPY.add}>
          <span className={PLAY_INVITE.choiceText}>{PLAY_HUB_COPY.botsAdd}</span>
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              disabled={isDisabled}
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
          disabled={isDisabled}
          onClick={() => void moves.bots(sessionId, fillLevel, true)}
        >
          {PLAY_HUB_COPY.botsFill}
        </button>
      </div>
    </div>
  )
}
