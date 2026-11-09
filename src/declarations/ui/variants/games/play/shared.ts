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

export const SETUP_FIRE =
  'border-[var(--play-bomb)] bg-[var(--play-bomb)] text-white hover:border-[var(--play-bomb)]'
