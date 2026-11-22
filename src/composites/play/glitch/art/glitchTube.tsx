import { GLITCH_BANNER } from '@/declarations/play/glitch/banner'

/**
 * Tube defs: scanlines, vignette and the two colour plates
 * @param {object} props - Id prefix
 * @return {JSX.Element}
 */

export const GlitchDefs = ({ id }: { id: string }) => (
  <>
    <pattern
      id={`${id}-scan`}
      width="8"
      height={GLITCH_BANNER.scanline}
      patternUnits="userSpaceOnUse"
    >
      <rect width="8" height={GLITCH_BANNER.scanline / 2} fill="black" opacity="0.32" />
    </pattern>
    <radialGradient id={`${id}-vignette`} r="0.75">
      <stop offset="0.55" stopColor="black" stopOpacity="0" />
      <stop offset="1" stopColor="black" stopOpacity="0.75" />
    </radialGradient>
    <radialGradient id={`${id}-bloom`} r="0.6">
      <stop offset="0" style={{ stopColor: 'var(--play-glitch-dusk)' }} />
      <stop offset="1" style={{ stopColor: 'var(--glitch-screen)' }} />
    </radialGradient>
    {(['red', 'cyan'] as const).map((plate) => (
      <filter key={plate} id={`${id}-${plate}`}>
        <feFlood style={{ floodColor: `var(--glitch-${plate})` }} />
        <feComposite in2="SourceAlpha" operator="in" />
      </filter>
    ))}
  </>
)

/**
 * One twin scene, a pixel landscape; the second copy hides the differences
 * @param {object} props - Twin flag
 * @return {JSX.Element}
 */

export const GlitchScene = ({ isTwin }: { isTwin?: boolean }) => (
  <g>
    <rect width="400" height="300" rx="10" style={{ fill: 'var(--play-glitch-deep)' }} />
    <rect
      x="8"
      y="8"
      width="384"
      height="284"
      rx="6"
      style={{ fill: 'var(--play-glitch-night)' }}
    />
    {!isTwin && <circle cx="300" cy="70" r="28" style={{ fill: 'var(--play-gold)' }} />}
    <path
      d="M8 230L110 120L170 180L250 90L392 220V292H8Z"
      style={{ fill: 'var(--play-glitch)' }}
      opacity="0.75"
    />
    <path d="M8 260L140 190L240 240L392 200V292H8Z" style={{ fill: 'var(--play-glitch-deep)' }} />
    <rect
      x="70"
      y={isTwin ? 196 : 200}
      width="44"
      height="36"
      style={{ fill: 'var(--glitch-paper)' }}
    />
    <path
      d={isTwin ? 'M64 200L92 176L120 200Z' : 'M64 200L92 168L120 200Z'}
      style={{ fill: 'var(--glitch-edge)' }}
    />
    {!isTwin && (
      <rect x="86" y="212" width="12" height="20" style={{ fill: 'var(--glitch-ink)' }} />
    )}
    <circle
      cx="236"
      cy="250"
      r={isTwin ? 8 : 14}
      style={{ fill: 'var(--glitch-paper)' }}
      opacity="0.9"
    />
  </g>
)

/**
 * Pink felt circles around the spotted differences
 * @param {object} props - Scene scale
 * @return {JSX.Element}
 */

export const GlitchFound = () => (
  <g
    fill="none"
    style={{ stroke: 'var(--play-glitch-glow)' }}
    strokeWidth="5"
    strokeLinecap="round"
  >
    {GLITCH_BANNER.differences.map((spot) => (
      <path
        key={`${spot.x}-${spot.y}`}
        d={`M${spot.x + spot.r} ${spot.y}A${spot.r} ${spot.r} 0 1 0 ${spot.x + spot.r * 0.7} ${spot.y - spot.r * 0.75}`}
      />
    ))}
  </g>
)
