// Shared arcade surfaces
export const PANEL =
  'rounded-2xl bg-[var(--play-panel)] ring-1 ring-[var(--play-line)] backdrop-blur-xl backdrop-saturate-150'

export const PLAY_PANEL = PANEL

// Lift of the main boxes, as on the Memora sections
export const LIFT = 'shadow-[var(--shadow-sm)]'

export const HEADING = 'text-xl font-extrabold tracking-tight text-[var(--play-ink)] sm:text-2xl'

export const NOTE = 'text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]'

// Bubble opened by the dock
export const BUBBLE = 'play-glass rounded-2xl'

// Opaque card for pickers
export const SOLID =
  'rounded-2xl bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)] shadow-xl'

export const SETUP_TILE =
  'rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)]'

// Picked in the game colour
export const SETUP_BLUE =
  'border-[var(--play-baccalaureat)] bg-[var(--play-baccalaureat)] text-white hover:border-[var(--play-baccalaureat)]'

export const SETUP_TEAL =
  'border-[var(--play-echo)] bg-[var(--play-echo)] text-white hover:border-[var(--play-echo)]'

export const SETUP_PINK =
  'border-[var(--play-glitch)] bg-[var(--play-glitch)] text-white hover:border-[var(--play-glitch)]'

export const SETUP_VIOLET =
  'border-[var(--play-jumble)] bg-[var(--play-jumble)] text-white hover:border-[var(--play-jumble)]'

export const SETUP_WOOD =
  'border-[var(--play-suspens)] bg-[var(--play-suspens)] text-white hover:border-[var(--play-suspens)]'

export const SETUP_AMBER =
  'border-[var(--play-croquis)] bg-[var(--play-croquis)] text-[var(--play-croquis-night)] hover:border-[var(--play-croquis)]'

export const SETUP_FIRE =
  'border-[var(--play-bomb)] bg-[var(--play-bomb)] text-white hover:border-[var(--play-bomb)]'

/**
 * Gold tile of a won trophy, black glyph, relief and glow
 * @type {string}
 */

export const PLAY_GOLD_TILE =
  'relative bg-[linear-gradient(150deg,color-mix(in_oklab,var(--play-gold)_60%,white),var(--play-gold)_40%,var(--play-gold-deep))] text-[var(--play-night)]! shadow-[inset_0_2px_0_rgb(255_255_255/0.6),inset_0_-3px_0_color-mix(in_oklab,var(--play-gold-deep)_70%,black)] ring-2 ring-[color-mix(in_oklab,var(--play-gold-deep)_80%,black)]'
