'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { LudoGameSettings } from '@/core/lib/play/ludo/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_RULE_COPY, LUDO_RULES_COPY, LUDO_SETUP_COPY } from '@/declarations/play/ludo/copy'
import type { LudoRuleName } from '@/declarations/play/ludo/settings'

export interface LudoRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: LudoGameSettings
}

/**
 * Rules chosen for a Ludo game, read only
 * @param {LudoRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const LudoRulesDrawer = ({ open, onClose, settings }: LudoRulesDrawerProps) => {
  const rows = [
    { label: LUDO_RULES_COPY.pawns, value: String(settings.pawns) },
    {
      label: LUDO_RULES_COPY.turn,
      value: fillPlayMessage(LUDO_SETUP_COPY.seconds, { seconds: settings.turnSeconds }),
    },
    { label: LUDO_RULES_COPY.exit, value: LUDO_SETUP_COPY[settings.exit] },
    { label: LUDO_RULES_COPY.ending, value: LUDO_SETUP_COPY[settings.ending] },
    ...(Object.keys(LUDO_RULE_COPY) as LudoRuleName[]).map((name) => ({
      label: LUDO_RULE_COPY[name].label,
      value: settings.rules[name] ? LUDO_RULES_COPY.on : LUDO_RULES_COPY.off,
    })),
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={LUDO_RULES_COPY.title} rows={rows} />
}
