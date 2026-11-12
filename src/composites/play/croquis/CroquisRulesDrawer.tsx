'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { CroquisGameSettings } from '@/core/lib/play/croquis/settings'
import {
  CROQUIS_LEVEL_LABELS,
  CROQUIS_RULES_COPY,
  CROQUIS_SETTINGS,
  CROQUIS_SETUP_COPY,
  fillPlayMessage,
} from '@/declarations/play'

export interface CroquisRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: CroquisGameSettings
}

/**
 * Rules chosen for a Croquis game, read only
 * @param {CroquisRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const CroquisRulesDrawer = ({ open, onClose, settings }: CroquisRulesDrawerProps) => {
  const { base, speedBonus, firstBonus, drawerPerGuess, drawerAllBonus } = CROQUIS_SETTINGS.scoring
  const rows = [
    {
      label: CROQUIS_RULES_COPY.laps,
      value: fillPlayMessage(CROQUIS_SETUP_COPY.count, { count: settings.laps }),
    },
    {
      label: CROQUIS_RULES_COPY.difficulty,
      value: CROQUIS_LEVEL_LABELS[settings.difficulty],
    },
    {
      label: CROQUIS_RULES_COPY.roundSeconds,
      value: fillPlayMessage(CROQUIS_SETUP_COPY.seconds, { seconds: settings.roundSeconds }),
    },
    {
      label: CROQUIS_RULES_COPY.hint,
      value: settings.hasHint ? CROQUIS_SETUP_COPY.hintOn : CROQUIS_SETUP_COPY.hintOff,
    },
    {
      label: CROQUIS_RULES_COPY.scoring,
      value: fillPlayMessage(CROQUIS_RULES_COPY.scoringValue, {
        base,
        speed: speedBonus,
        first: firstBonus,
      }),
    },
    {
      label: CROQUIS_RULES_COPY.drawer,
      value: fillPlayMessage(CROQUIS_RULES_COPY.drawerValue, {
        each: drawerPerGuess,
        all: drawerAllBonus,
      }),
    },
  ]

  return (
    <PlayRulesDrawer open={open} onClose={onClose} title={CROQUIS_RULES_COPY.title} rows={rows} />
  )
}
