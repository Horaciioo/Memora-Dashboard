'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { JumbleGameSettings } from '@/core/lib/play/jumble/settings'
import {
  JUMBLE_LEVEL_COPY,
  JUMBLE_RULES_COPY,
  JUMBLE_SETTINGS,
  JUMBLE_SETUP_COPY,
  fillPlayMessage,
} from '@/declarations/play'

export interface JumbleRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: JumbleGameSettings
}

/**
 * Rules chosen for a Jumble game, read only
 * @param {JumbleRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const JumbleRulesDrawer = ({ open, onClose, settings }: JumbleRulesDrawerProps) => {
  const { base, speedBonus, flashBonus, streakStep, streakMax } = JUMBLE_SETTINGS.scoring
  const rows = [
    {
      label: JUMBLE_RULES_COPY.rounds,
      value: fillPlayMessage(JUMBLE_SETUP_COPY.count, { count: settings.rounds }),
    },
    { label: JUMBLE_RULES_COPY.difficulty, value: JUMBLE_LEVEL_COPY[settings.difficulty] },
    {
      label: JUMBLE_RULES_COPY.roundSeconds,
      value: fillPlayMessage(JUMBLE_SETUP_COPY.seconds, { seconds: settings.roundSeconds }),
    },
    {
      label: JUMBLE_RULES_COPY.hint,
      value: settings.hasHint ? JUMBLE_SETUP_COPY.hintOn : JUMBLE_SETUP_COPY.hintOff,
    },
    {
      label: JUMBLE_RULES_COPY.scoring,
      value: fillPlayMessage(JUMBLE_RULES_COPY.scoringValue, {
        base,
        speed: speedBonus,
        flash: flashBonus,
      }),
    },
    {
      label: JUMBLE_RULES_COPY.streak,
      value: fillPlayMessage(JUMBLE_RULES_COPY.streakValue, {
        step: streakStep,
        max: streakStep * streakMax,
      }),
    },
  ]

  return (
    <PlayRulesDrawer open={open} onClose={onClose} title={JUMBLE_RULES_COPY.title} rows={rows} />
  )
}
