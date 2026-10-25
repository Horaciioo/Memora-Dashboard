'use client'

import { clockLabel } from '@/composites/play/baccalaureat/clockLabel'
import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { BaccalaureatGameSettings } from '@/core/lib/play/baccalaureat/settings'
import { BAC_RULES_COPY, BACCALAUREAT_SETTINGS, fillPlayMessage } from '@/declarations/play'

export interface BacRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: BaccalaureatGameSettings
  // Rounds in a tournament, null for a single game
  tournamentGames: number | null
}

/**
 * Rules chosen for the game, read only
 * @param {BacRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const BacRulesDrawer = ({
  open,
  onClose,
  settings,
  tournamentGames,
}: BacRulesDrawerProps) => {
  const stop = !settings.stop
    ? BAC_RULES_COPY.stopOff
    : settings.autoStop
      ? BAC_RULES_COPY.stopAuto
      : BAC_RULES_COPY.stopOn
  const rows = [
    {
      label: BAC_RULES_COPY.categories,
      value: settings.categories.map((category) => category.label).join(', '),
    },
    {
      label: BAC_RULES_COPY.letters,
      value: fillPlayMessage(BAC_RULES_COPY.lettersCount, {
        count: settings.letters.length,
        total: BACCALAUREAT_SETTINGS.alphabet.length,
      }),
    },
    { label: BAC_RULES_COPY.rounds, value: String(settings.rounds) },
    { label: BAC_RULES_COPY.roundSeconds, value: clockLabel(settings.roundSeconds) },
    { label: BAC_RULES_COPY.stop, value: stop },
    {
      label: BAC_RULES_COPY.type,
      value: tournamentGames
        ? fillPlayMessage(BAC_RULES_COPY.tournament, { games: tournamentGames })
        : BAC_RULES_COPY.single,
    },
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={BAC_RULES_COPY.title} rows={rows} />
}
