'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { GlitchGameSettings } from '@/core/lib/play/glitch/settings'
import {
  GLITCH_RULES_COPY,
  GLITCH_SETTINGS,
  GLITCH_SETUP_COPY,
  fillPlayMessage,
} from '@/declarations/play'
import { SECOND_MS } from '@/utils/constants/time'

export interface GlitchRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: GlitchGameSettings
}

/**
 * Rules chosen for a Glitch game, read only
 * @param {GlitchRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const GlitchRulesDrawer = ({ open, onClose, settings }: GlitchRulesDrawerProps) => {
  const { perFind, finishBonus, speedBonus } = GLITCH_SETTINGS.scoring
  const rows = [
    {
      label: GLITCH_RULES_COPY.rounds,
      value: fillPlayMessage(GLITCH_SETUP_COPY.count, { count: settings.rounds }),
    },
    {
      label: GLITCH_RULES_COPY.differences,
      value: fillPlayMessage(GLITCH_SETUP_COPY.differenceCount, { count: settings.differences }),
    },
    {
      label: GLITCH_RULES_COPY.roundSeconds,
      value: fillPlayMessage(GLITCH_SETUP_COPY.seconds, { seconds: settings.roundSeconds }),
    },
    {
      label: GLITCH_RULES_COPY.scoring,
      value: fillPlayMessage(GLITCH_RULES_COPY.scoringValue, {
        find: perFind,
        first: finishBonus,
        speed: speedBonus,
      }),
    },
    {
      label: GLITCH_RULES_COPY.lock,
      value: fillPlayMessage(GLITCH_RULES_COPY.lockValue, {
        seconds: GLITCH_SETTINGS.lockMs / SECOND_MS,
      }),
    },
  ]

  return (
    <PlayRulesDrawer open={open} onClose={onClose} title={GLITCH_RULES_COPY.title} rows={rows} />
  )
}
