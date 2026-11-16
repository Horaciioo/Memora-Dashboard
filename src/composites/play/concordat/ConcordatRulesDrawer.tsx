'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { ConcordatGameSettings } from '@/core/lib/play/concordat/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import {
  CONCORDAT_MODE_LABELS,
  CONCORDAT_RULES_COPY,
  CONCORDAT_SETUP_COPY,
  CONCORDAT_SIZE_LABELS,
  CONCORDAT_SPEED_LABELS,
  CONCORDAT_STYLE_LABELS,
} from '@/declarations/play/concordat/copy'
import { CONCORDAT } from '@/declarations/play/concordat/rules'

export interface ConcordatRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: ConcordatGameSettings
}

/**
 * Rules chosen for a Concordat game, read only
 * @param {ConcordatRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const ConcordatRulesDrawer = ({ open, onClose, settings }: ConcordatRulesDrawerProps) => {
  const copy = CONCORDAT_RULES_COPY
  const minutes = (count: number) =>
    fillPlayMessage(CONCORDAT_SETUP_COPY.minutes, { minutes: count })
  const rows = [
    { label: copy.mode, value: CONCORDAT_MODE_LABELS[settings.mode] },
    {
      label: copy.map,
      value: `${CONCORDAT_SIZE_LABELS[settings.size]}, ${CONCORDAT_STYLE_LABELS[settings.style]}`,
    },
    { label: copy.speed, value: CONCORDAT_SPEED_LABELS[settings.speed] },
    { label: copy.duration, value: minutes(settings.durationMinutes) },
    {
      label: copy.start,
      value: fillPlayMessage(copy.startValue, { seconds: CONCORDAT.pickSeconds }),
    },
    { label: copy.attack, value: copy.attackValue },
    {
      label: copy.win,
      value: fillPlayMessage(copy.winValue, {
        share: Math.round(CONCORDAT.victory.dominationShare * 100),
      }),
    },
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={copy.title} rows={rows} />
}
