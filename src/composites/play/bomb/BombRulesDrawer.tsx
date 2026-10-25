'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import { wordsNeeded } from '@/core/lib/play/bomb/settings'
import type { BombGameSettings } from '@/core/lib/play/bomb/settings'
import { BOMB_RULES_COPY, BOMB_SETUP_COPY, fillPlayMessage } from '@/declarations/play'

export interface BombRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: BombGameSettings
}

/**
 * Rules chosen for a Bomb Party game, read only
 * @param {BombRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const BombRulesDrawer = ({ open, onClose, settings }: BombRulesDrawerProps) => {
  const rows = [
    { label: BOMB_RULES_COPY.dictionary, value: BOMB_SETUP_COPY.dictionaryValue },
    {
      label: BOMB_RULES_COPY.difficulty,
      value: `${BOMB_SETUP_COPY[settings.difficulty]} - ${fillPlayMessage(BOMB_SETUP_COPY.wordsPerPrompt, { count: wordsNeeded(settings) })}`,
    },
    {
      label: BOMB_RULES_COPY.lives,
      value: fillPlayMessage(BOMB_RULES_COPY.livesValue, {
        start: settings.startLives,
        max: settings.maxLives,
      }),
    },
    {
      label: BOMB_RULES_COPY.minTurn,
      value: fillPlayMessage(BOMB_SETUP_COPY.seconds, { seconds: settings.minTurnSeconds }),
    },
    {
      label: BOMB_RULES_COPY.promptAge,
      value: fillPlayMessage(BOMB_SETUP_COPY.turns, { count: settings.promptAge }),
    },
    { label: BOMB_RULES_COPY.bonus, value: settings.bonusAlphabet.join(' ') },
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={BOMB_RULES_COPY.title} rows={rows} />
}
