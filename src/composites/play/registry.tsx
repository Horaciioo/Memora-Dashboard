'use client'

import type { ComponentType } from 'react'
import type { Prisma } from '@prisma/client'

import { BacRulesDrawer } from '@/composites/play/baccalaureat/BacRulesDrawer'
import { BacSetupDrawer } from '@/composites/play/baccalaureat/BacSetupDrawer'
import { BombRulesDrawer } from '@/composites/play/bomb/BombRulesDrawer'
import { BombSetupDrawer } from '@/composites/play/bomb/BombSetupDrawer'
import { GolfRulesDrawer } from '@/composites/play/golf/setup/GolfRulesDrawer'
import { GolfSetupDrawer } from '@/composites/play/golf/setup/GolfSetupDrawer'
import { GolfStartVote } from '@/composites/play/golf/vote/GolfStartVote'
import { LudoRulesDrawer } from '@/composites/play/ludo/LudoRulesDrawer'
import { LudoSetupDrawer } from '@/composites/play/ludo/LudoSetupDrawer'
import { baccalaureatSettingsOf } from '@/core/lib/play/baccalaureat/settings'
import { bombSettingsOf } from '@/core/lib/play/bomb/settings'
import { golfSettingsOf } from '@/core/lib/play/golf/settings'
import { ludoSettingsOf } from '@/core/lib/play/ludo/settings'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Rules of a lobby
 * @typedef {Object} PlayRulesValue
 */

export interface PlayRulesValue {
  settings: Prisma.JsonValue
  // Games in a tournament, null for a single game
  tournamentGames: number | null
}

/**
 * What every setup drawer takes
 * @typedef {Object} PlaySetupProps
 */

export interface PlaySetupProps {
  open: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (setup: object) => void
  // Rules being edited, none for a new game
  current?: PlayRulesValue
}

/**
 * What every start vote takes, asked of the host when the game launches
 * @typedef {Object} PlayVoteProps
 */

export interface PlayVoteProps {
  sessionId: string
  settings: Prisma.JsonValue
  // Server ms at the page render
  serverTime: number
  viewerId: string
  hostId: string
  // Players of the table by account
  faces: Record<string, { name: string; avatarUrl: string | null }>
}

/**
 * What every rules drawer takes
 * @typedef {Object} PlayRulesProps
 */

export interface PlayRulesProps extends PlayRulesValue {
  open: boolean
  onClose: () => void
}

/**
 * Setup drawer per game, none opens straight away
 * @type {Partial<Record<PlayGameName, ComponentType<PlaySetupProps>>>}
 */

export const PLAY_SETUP_DRAWERS: Partial<Record<PlayGameName, ComponentType<PlaySetupProps>>> = {
  [PlayGames.Baccalaureat]: BacSetupDrawer,
  [PlayGames.Bomb]: BombSetupDrawer,
  [PlayGames.Golf]: GolfSetupDrawer,
  [PlayGames.Ludo]: LudoSetupDrawer,
}

/**
 * Vote opened when the host launches, none starts straight away
 * @type {Partial<Record<PlayGameName, ComponentType<PlayVoteProps>>>}
 */

export const PLAY_START_VOTES: Partial<Record<PlayGameName, ComponentType<PlayVoteProps>>> = {
  [PlayGames.Golf]: GolfStartVote,
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
  [PlayGames.Ludo]: ({ open, onClose, settings }) => (
    <LudoRulesDrawer open={open} onClose={onClose} settings={ludoSettingsOf(settings)} />
  ),
}
