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
    safety: 'stopgo-card-safety',
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
  rivalRow: 'stopgo-rival-row',
  rival: 'stopgo-rival',
  rivalAim: 'stopgo-rival-aim',
  handBox: 'stopgo-hand-box',
  mid: 'stopgo-dock-mid',
  midInner: 'stopgo-dock-mid-inner',
  hand: 'stopgo-hand',
  slot: 'stopgo-hand-slot',
  slotDrawn: 'stopgo-hand-slot-drawn',
  drawn: 'stopgo-drawn',
  tray: 'stopgo-tray',
  trayCard: 'stopgo-tray-card',
  trayText: 'stopgo-tray-text',
  targets: 'stopgo-targets',
  target: 'stopgo-target',
  targetOn: 'stopgo-target-on',
  action: 'stopgo-action',
  actionGhost: 'stopgo-action-ghost',
  piles: 'stopgo-piles',
  fold: 'stopgo-fold',
  foldShut: 'stopgo-fold-shut',
  dockFolded: 'stopgo-dock-folded',
  deck: 'stopgo-deck',
  deckStack: 'stopgo-deck-stack',
  deckCard: 'stopgo-deck-card',
  deckReady: 'stopgo-deck-ready',
  deckInfo: 'stopgo-deck-info',
  light: 'stopgo-light',
  pile: 'stopgo-pile',
  pileOver: 'stopgo-pile-over',
  sealed: 'stopgo-sealed',
  offer: 'stopgo-offer',
  offerRow: 'stopgo-offer-row',
  offerLead: 'stopgo-offer-lead',
  offerClock: 'stopgo-offer-clock',
} as const

/**
 * Layer of flying cards
 * @type {Record<string, string>}
 */

export const STOPGO_FX_STYLES = {
  layer: 'stopgo-fx-layer',
  flight: 'stopgo-fx-flight',
} as const

/**
 * Elements the animations find on screen
 * @type {Object}
 */

export const STOPGO_FX_ANCHORS = {
  hand: '[data-stopgo-hand]',
  discard: '[data-stopgo-discard]',
  car: (id: string) => `[data-stopgo-car="${id}"]`,
} as const

/**
 * Result screen: podium, then the race strip and the sealed cards
 * @type {Record<string, string>}
 */

export const STOPGO_RESULT = {
  root: 'flex min-h-0 w-full flex-1 flex-col items-center justify-center',
  under:
    'flex w-full max-w-3xl shrink-0 flex-col items-center gap-[clamp(0.4rem,1.2dvh,0.8rem)] px-4 pb-[clamp(0.5rem,2dvh,1.25rem)]',
  caption: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-faint)] uppercase',
  strip: 'h-[clamp(2.5rem,8dvh,4.5rem)] w-full',
  sealedRow: 'flex flex-wrap items-center justify-center gap-2',
  sealed:
    'inline-flex items-center gap-1.5 rounded-lg bg-[var(--play-chip)] px-2 py-1 text-xs font-bold text-[var(--play-ink)]',
  sealedGlyph: 'size-5',
} as const
