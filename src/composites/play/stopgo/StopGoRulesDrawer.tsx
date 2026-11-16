'use client'

import { PlayRulesDrawer } from '@/composites/play/rules/PlayRulesDrawer'
import type { StopGoGameSettings } from '@/core/lib/play/stopgo/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_CARDS, StopGoFamilies } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import {
  STOPGO_CARD_COPY,
  STOPGO_RULES_COPY,
  STOPGO_SETUP_COPY,
} from '@/declarations/play/stopgo/copy'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

export interface StopGoRulesDrawerProps {
  open: boolean
  onClose: () => void
  settings: StopGoGameSettings
}

// Cards of one family in catalogue order
const keysOf = (family: string) =>
  (Object.keys(STOPGO_CARDS) as StopGoCardKey[]).filter(
    (key) => STOPGO_CARDS[key].family === family
  )

// Card names of one family, as a list
const namesOf = (family: string) =>
  keysOf(family)
    .map((key) => STOPGO_CARD_COPY[key].name)
    .join(', ')

/**
 * Rules chosen for a Stop & Go race, read only
 * @param {StopGoRulesDrawerProps} props - Drawer state and rules
 * @return {JSX.Element}
 */

export const StopGoRulesDrawer = ({ open, onClose, settings }: StopGoRulesDrawerProps) => {
  const copy = STOPGO_RULES_COPY
  const distances = keysOf(StopGoFamilies.Distance)
    .map((key) => ('km' in STOPGO_CARDS[key] ? STOPGO_CARDS[key].km : 0))
    .join(', ')
  const rows = [
    { label: copy.target, value: fillPlayMessage(STOPGO_SETUP_COPY.km, { km: settings.target }) },
    {
      label: copy.turnSeconds,
      value: fillPlayMessage(STOPGO_SETUP_COPY.seconds, { seconds: settings.turnSeconds }),
    },
    {
      label: copy.start,
      value: STOPGO_SETTINGS.startsStopped ? copy.startStopped : copy.startRolling,
    },
    {
      label: copy.draw,
      value: fillPlayMessage(copy.drawValue, { share: Math.round(STOPGO_SETTINGS.kmShare * 100) }),
    },
    { label: copy.distances, value: fillPlayMessage(copy.distancesValue, { list: distances }) },
    { label: copy.finish, value: copy.finishValue },
    {
      label: copy.attacks,
      value: fillPlayMessage(copy.attacksValue, { list: namesOf(StopGoFamilies.Attack) }),
    },
    { label: copy.sameMalus, value: copy.sameMalusValue },
    {
      label: copy.limit,
      value: fillPlayMessage(copy.limitValue, { km: STOPGO_SETTINGS.limitMaxKm }),
    },
    {
      label: copy.accident,
      value: fillPlayMessage(copy.accidentValue, { count: STOPGO_SETTINGS.accidentMinTargets }),
    },
    {
      label: copy.remedies,
      value: fillPlayMessage(copy.remediesValue, { list: namesOf(StopGoFamilies.Remedy) }),
    },
    {
      label: copy.goodDraw,
      value: fillPlayMessage(copy.goodDrawValue, { seconds: STOPGO_SETTINGS.goodDrawSeconds }),
    },
    {
      label: copy.mystery,
      value: fillPlayMessage(copy.mysteryValue, { cost: STOPGO_SETTINGS.mysteryCost }),
    },
    {
      label: copy.safeties,
      value: fillPlayMessage(copy.safetiesValue, { list: namesOf(StopGoFamilies.Safety) }),
    },
    {
      label: copy.counter,
      value: fillPlayMessage(copy.counterValue, { seconds: STOPGO_SETTINGS.counterSeconds }),
    },
    {
      label: copy.strikes,
      value: fillPlayMessage(copy.strikesValue, {
        count: STOPGO_SETTINGS.strikes,
        seconds: STOPGO_SETTINGS.afkSeconds,
      }),
    },
  ]

  return <PlayRulesDrawer open={open} onClose={onClose} title={copy.title} rows={rows} />
}
