'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { SuspensGameSettings } from '@/core/lib/play/suspens/settings'
import {
  fillPlayMessage,
  SUSPENS_RULES_COPY,
  SUSPENS_SETTINGS,
  SUSPENS_SETUP_COPY,
} from '@/declarations/play'

export interface SuspensRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: SuspensGameSettings
}

/**
 * Rules chosen for a Suspens game, read only
 * @param {SuspensRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const SuspensRulesDrawer = ({ open, onClose, settings }: SuspensRulesDrawerProps) => {
  const { cell, solve, setterPerError, setterHang } = SUSPENS_SETTINGS.scoring
  const seconds = (count: number) => fillPlayMessage(SUSPENS_SETUP_COPY.seconds, { seconds: count })
  const rows = [
    {
      label: SUSPENS_RULES_COPY.laps,
      value: fillPlayMessage(SUSPENS_SETUP_COPY.count, { count: settings.laps }),
    },
    { label: SUSPENS_RULES_COPY.errors, value: String(settings.errors) },
    { label: SUSPENS_RULES_COPY.turnSeconds, value: seconds(settings.turnSeconds) },
    { label: SUSPENS_RULES_COPY.pickSeconds, value: seconds(settings.pickSeconds) },
    { label: SUSPENS_RULES_COPY.guess, value: SUSPENS_RULES_COPY.guessValue },
    { label: SUSPENS_RULES_COPY.timeout, value: SUSPENS_RULES_COPY.timeoutValue },
    {
      label: SUSPENS_RULES_COPY.scoring,
      value: fillPlayMessage(SUSPENS_RULES_COPY.scoringValue, { cell, solve }),
    },
    {
      label: SUSPENS_RULES_COPY.setter,
      value: fillPlayMessage(SUSPENS_RULES_COPY.setterValue, {
        error: setterPerError,
        hang: setterHang,
      }),
    },
  ]

  return (
    <PlayRulesDrawer open={open} onClose={onClose} title={SUSPENS_RULES_COPY.title} rows={rows} />
  )
}
