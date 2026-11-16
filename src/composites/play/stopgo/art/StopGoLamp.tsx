import type { StopGoLight } from '@/composites/play/stopgo/cards/lights'

// Lit row per light
const ROWS = { red: 0, broken: 1, green: 2 } as const

/**
 * Traffic light, the lit lamp blinks
 * @param {{ light: StopGoLight }} props - Light
 * @return {JSX.Element}
 */

export const StopGoLamp = ({ light }: { light: StopGoLight }) => (
  <svg viewBox="0 0 24 48" className="stopgo-lamp" data-light={light} aria-hidden>
    <rect x="3" y="1" width="18" height="46" rx="6" className="stopgo-lamp-body" />
    {[0, 1, 2].map((row) => (
      <circle
        key={row}
        cx="12"
        cy={11 + row * 13}
        r="5"
        className="stopgo-lamp-dot"
        data-lit={row === ROWS[light] || undefined}
      />
    ))}
  </svg>
)
