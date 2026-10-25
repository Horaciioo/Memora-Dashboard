'use client'

import type { ComponentType } from 'react'
import type { Prisma } from '@prisma/client'

import { BacRulesDrawer } from '@/composites/play/baccalaureat/BacRulesDrawer'
import { BacSetupDrawer } from '@/composites/play/baccalaureat/BacSetupDrawer'
import { BombRulesDrawer } from '@/composites/play/bomb/BombRulesDrawer'
import { BombSetupDrawer } from '@/composites/play/bomb/BombSetupDrawer'
import { GolfRulesDrawer } from '@/composites/play/golf/setup/GolfRulesDrawer'
import { GolfSetupDrawer } from '@/composites/play/golf/setup/GolfSetupDrawer'
import { baccalaureatSettingsOf } from '@/core/lib/play/baccalaureat/settings'
import { bombSettingsOf } from '@/core/lib/play/bomb/settings'
import { golfSettingsOf } from '@/core/lib/play/golf/settings'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * What every setup drawer takes
 * @typedef {Object} PlaySetupProps
 */

export interface PlaySetupProps {
  open: boolean
  isSaving: boolean
  onClose: () => void
  onCreate: (setup: object) => void
}

/**
 * What every rules drawer takes
 * @typedef {Object} PlayRulesProps
 */

export interface PlayRulesProps {
  open: boolean
  onClose: () => void
  settings: Prisma.JsonValue
  // Games in a tournament, null for a single game
  tournamentGames: number | null
}

/**
 * Setup drawer per game, none opens straight away
 * @type {Partial<Record<PlayGameName, ComponentType<PlaySetupProps>>>}
 */

export const PLAY_SETUP_DRAWERS: Partial<Record<PlayGameName, ComponentType<PlaySetupProps>>> = {
  [PlayGames.Baccalaureat]: BacSetupDrawer,
  [PlayGames.Bomb]: BombSetupDrawer,
  [PlayGames.Golf]: GolfSetupDrawer,
}

/**
 * Rules drawer per game
 * @type {Partial<Record<PlayGameName, ComponentType<PlayRulesProps>>>}
 */

export const PLAY_RULES_DRAWERS: Partial<Record<PlayGameName, ComponentType<PlayRulesProps>>> = {
  [PlayGames.Baccalaureat]: ({ settings, ...props }) => (
    <BacRulesDrawer {...props} settings={baccalaureatSettingsOf(settings)} />
  ),
  [PlayGames.Bomb]: ({ open, onClose, settings }) => (
    <BombRulesDrawer open={open} onClose={onClose} settings={bombSettingsOf(settings)} />
  ),
  [PlayGames.Golf]: ({ open, onClose, settings }) => (
    <GolfRulesDrawer open={open} onClose={onClose} settings={golfSettingsOf(settings)} />
  ),
}
