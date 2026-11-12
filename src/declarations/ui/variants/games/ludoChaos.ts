/**
 * Chaos effects played over the board
 * @type {Record<string, string>}
 */

export const LUDO_FX = {
  layer: 'ludo-fx',
  spot: 'ludo-fx-spot',
  card: 'ludo-fx-card',
  cardBonus: 'ludo-fx-card-bonus',
  cardMalus: 'ludo-fx-card-malus',
  cardJoker: 'ludo-fx-card-joker',
  cardEnd: 'ludo-fx-card-end',
  glyph: 'ludo-fx-glyph',
  tag: 'ludo-fx-tag',
  name: 'ludo-fx-name',
  text: 'ludo-fx-text',
  veil: 'ludo-fx-veil',
  ring: 'ludo-fx-ring',
  ghostPawn: 'ludo-fx-ghost-pawn',
  wisp: 'ludo-fx-wisp',
  flyDie: 'ludo-fx-fly-die',
  clash: 'ludo-fx-clash',
  streak: 'ludo-fx-streak',
  chevrons: 'ludo-fx-chevrons',
  prism: 'ludo-fx-prism',
  wash: 'ludo-fx-wash',
  bolt: 'ludo-fx-bolt',
  broken: 'ludo-fx-broken',
  half: 'ludo-fx-half',
  spark: 'ludo-fx-spark',
  range: 'ludo-fx-range',
  dim: 'ludo-fx-dim',
  sleeper: 'ludo-fx-sleeper',
  smoke: 'ludo-fx-smoke',
  zzz: 'ludo-fx-zzz',
  iris: 'ludo-fx-iris',
  orbit: 'ludo-fx-orbit',
  shield: 'ludo-fx-shield',
  shard: 'ludo-fx-shard',
  faded: 'ludo-fx-faded',
} as const

/**
 * Duel of dice over the board
 * @type {Record<string, string>}
 */

export const LUDO_DUEL = {
  layer: 'ludo-duel',
  roll: 'ludo-duel-roll',
  rollHint: 'ludo-duel-roll-hint',
  seat: 'ludo-duel-seat',
  die: 'ludo-duel-die',
  win: 'ludo-duel-win',
  lose: 'ludo-duel-lose',
  name: 'ludo-duel-name',
  crown: 'ludo-duel-crown',
  hub: 'ludo-duel-hub',
  shock: 'ludo-duel-shock',
  draw: 'ludo-duel-draw',
  verdict: 'ludo-duel-verdict',
} as const

/**
 * Joker card and its chip
 * @type {Record<string, string>}
 */

export const LUDO_JOKER = {
  offer: 'ludo-joker-offer',
  card: 'ludo-joker-card',
  cardOut: 'ludo-joker-card-out',
  corner: 'ludo-joker-corner',
  art: 'ludo-joker-art',
  hint: 'ludo-joker-hint',
  glyph: 'ludo-joker-glyph',
  lead: 'ludo-joker-lead',
  name: 'ludo-joker-name',
  text: 'ludo-joker-text',
  endure: 'ludo-joker-endure',
  clock: 'ludo-joker-clock',
  home: 'ludo-home-count',
  homePawn: 'ludo-home-pawn',
  chip: 'ludo-joker-chip',
  chipCard: 'ludo-joker-chip-card',
  chipCount: 'ludo-joker-chip-count',
  chipEmpty: 'ludo-joker-chip-empty',
} as const

/**
 * Pieces Chaos adds to the table
 * @type {Record<string, string>}
 */

export const LUDO_CHAOS_PIECES = {
  mark: 'ludo-chaos-mark',
  pawnGhost: 'ludo-pawn-ghost',
  pawnReal: 'ludo-pawn-real',
  pawnFade: 'ludo-pawn-fade',
  pawnRewind: 'ludo-pawn-rewind',
  ownTag: 'ludo-own-tag',
  blindMark: 'ludo-blind-mark',
  dieStack: 'ludo-die-stack',
  dieKept: 'ludo-die-kept',
  dieDropped: 'ludo-die-dropped',
  dieChoice: 'ludo-die-choice',
  plateStalled: 'ludo-plate-stalled',
  recolor: 'ludo-recolor',
  effectChip: 'ludo-effect-chip',
} as const
