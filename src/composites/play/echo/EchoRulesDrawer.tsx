'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { EchoGameSettings } from '@/core/lib/play/echo/settings'
import {
  ECHO_RULES_COPY,
  ECHO_SETTINGS,
  ECHO_SETUP_COPY,
  fillPlayMessage,
} from '@/declarations/play'
import { SECOND_MS } from '@/utils/constants/time'

export interface EchoRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: EchoGameSettings
}

/**
 * Rules chosen for an Echo game, read only
 * @param {EchoRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const EchoRulesDrawer = ({ open, onClose, settings }: EchoRulesDrawerProps) => {
  const { base, speedBonus, firstBonus } = ECHO_SETTINGS.scoring
  const rows = [
    {
      label: ECHO_RULES_COPY.rounds,
      value: fillPlayMessage(ECHO_SETUP_COPY.count, { count: settings.rounds }),
    },
    {
      label: ECHO_RULES_COPY.roundSeconds,
      value: fillPlayMessage(ECHO_SETUP_COPY.seconds, { seconds: settings.roundSeconds }),
    },
    {
      label: ECHO_RULES_COPY.scoring,
      value: fillPlayMessage(ECHO_RULES_COPY.scoringValue, {
        base,
        speed: speedBonus,
        first: firstBonus,
      }),
    },
    {
      label: ECHO_RULES_COPY.miss,
      value: fillPlayMessage(ECHO_RULES_COPY.missValue, {
        seconds: ECHO_SETTINGS.lockMs / SECOND_MS,
      }),
    },
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={ECHO_RULES_COPY.title} rows={rows} />
}
