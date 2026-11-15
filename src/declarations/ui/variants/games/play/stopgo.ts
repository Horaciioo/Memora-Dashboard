import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { SETUP_ROAD } from '@/declarations/ui/variants/games/play/shared'

/**
 * Setup drawer of a new Stop & Go race
 * @type {PlaySetupStyles}
 */

export const STOPGO_SETUP = setupStyles(SETUP_ROAD)

/**
 * Card face and its states
 * @type {Record<string, string>}
 */

export const STOPGO_CARD = {
  card: 'stopgo-card',
  head: 'stopgo-card-head',
  glyph: 'stopgo-card-glyph',
  km: 'stopgo-card-km',
  name: 'stopgo-card-name',
  hint: 'stopgo-card-hint',
  family: {
    distance: 'stopgo-card-distance',
    attack: 'stopgo-card-attack',
    remedy: 'stopgo-card-remedy',
    bonus: 'stopgo-card-bonus',
  },
  playable: 'stopgo-card-playable',
  locked: 'stopgo-card-locked',
  chosen: 'stopgo-card-chosen',
  back: 'stopgo-card-back',
} as const

/**
 * Hand, tray, panels and invites
 * @type {Record<string, string>}
 */

export const STOPGO_HAND = {
  dock: 'stopgo-dock',
  rivals: 'stopgo-rivals',
  hand: 'stopgo-hand',
  slot: 'stopgo-hand-slot',
  tray: 'stopgo-tray',
  trayText: 'stopgo-tray-text',
  targets: 'stopgo-targets',
  target: 'stopgo-target',
  targetOn: 'stopgo-target-on',
  action: 'stopgo-action',
  actionGhost: 'stopgo-action-ghost',
  piles: 'stopgo-piles',
  pile: 'stopgo-pile',
  pileOver: 'stopgo-pile-over',
  panel: 'stopgo-panel',
  panelTitle: 'stopgo-panel-title',
  state: 'stopgo-state',
  malus: 'stopgo-malus',
  jokers: 'stopgo-jokers',
  joker: 'stopgo-joker',
  jokerSpent: 'stopgo-joker-spent',
  sealed: 'stopgo-sealed',
  offer: 'stopgo-offer',
  offerRow: 'stopgo-offer-row',
  offerLead: 'stopgo-offer-lead',
  offerClock: 'stopgo-offer-clock',
} as const
