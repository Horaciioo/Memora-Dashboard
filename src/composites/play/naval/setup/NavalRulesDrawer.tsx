'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { NavalGameSettings } from '@/core/lib/play/naval/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { navalMapTitle } from '@/declarations/play/naval/maps'
import {
  NAVAL_MODE_COPY,
  NAVAL_RULE_COPY,
  NAVAL_RULES_COPY,
  NAVAL_SETUP_COPY,
} from '@/declarations/play/naval/copy'
import type { NavalRuleName } from '@/declarations/play/naval/settings'

/**
 * Choices of a naval battle, read only
 * @param {Object} props - Drawer
 * @param {boolean} props.open - Shown
 * @param {() => void} props.onClose - Close
 * @param {NavalGameSettings} props.settings - Settings
 * @return {JSX.Element}
 */

export const NavalRulesDrawer = ({
  open,
  onClose,
  settings,
}: {
  open: boolean
  onClose: () => void
  settings: NavalGameSettings
}) => {
  const seconds = (value: number) => fillPlayMessage(NAVAL_SETUP_COPY.seconds, { seconds: value })
  const rows = [
    { label: NAVAL_RULES_COPY.mode, value: NAVAL_MODE_COPY[settings.mode].title },
    { label: NAVAL_RULES_COPY.map, value: navalMapTitle(settings.map) },
    { label: NAVAL_RULES_COPY.turn, value: seconds(settings.turnSeconds) },
    { label: NAVAL_RULES_COPY.placement, value: seconds(settings.placementSeconds) },
    ...(Object.keys(NAVAL_RULE_COPY) as NavalRuleName[]).map((name) => ({
      label: NAVAL_RULE_COPY[name].label,
      value: settings.rules[name] ? NAVAL_RULES_COPY.on : NAVAL_RULES_COPY.off,
    })),
  ]

  return (
    <PlayRulesDrawer open={open} onClose={onClose} title={NAVAL_RULES_COPY.title} rows={rows} />
  )
}
