import type { GlyphProps } from '@/components/elements/display/glyphs/Glyphs'
import { Duo } from '@/components/elements/display/glyphs/PlayGlyphs'

// Golf set of Memora Play, same duotone as the other games

/**
 * Tornado power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfTornadoGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M4 5h16l-3 4H7.5zM8 13h9l-2.5 3.5H10z" />}>
    <path d="M4 5h16M5.5 9h12M8 13h9M10 17h5.5M12 20.5h2" />
  </Duo>
)

/**
 * Sticky walls power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfStickyGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<rect x="3.5" y="3.5" width="5" height="17" rx="1.5" />}>
    <rect x="3.5" y="3.5" width="5" height="17" rx="1.5" />
    <circle cx="13" cy="12" r="3.5" />
    <path d="M8.5 9.5c1.5 0 1.5 5 0 5M19 8.5v1.5M20.5 13.5v1.5M18 17v1.2" />
  </Duo>
)

/**
 * Giant ball power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfGiantGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="14" cy="14" r="6.5" />}>
    <circle cx="14" cy="14" r="6.5" />
    <circle cx="5.5" cy="5.5" r="2" />
    <path d="M8 8l2.2 2.2M10.5 6h-3M6 10.5v-3" />
  </Duo>
)

/**
 * Mini ball power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfMiniGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="16.5" cy="16.5" r="2.5" />}>
    <circle cx="16.5" cy="16.5" r="2.5" />
    <circle cx="8" cy="8" r="4.5" strokeDasharray="2 2.2" />
    <path d="M11.5 11.5l2.6 2.6M14.5 11.5v3h-3" />
  </Duo>
)

/**
 * Anti-collision power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfShieldGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={<path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z" />}
  >
    <path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z" />
    <circle cx="12" cy="11.5" r="2.6" />
  </Duo>
)

/**
 * Bumper power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfBumperGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="12" cy="12" r="5" />}>
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.6" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </Duo>
)

/**
 * Ghost ball power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfGhostGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={<path d="M5.5 20V11a6.5 6.5 0 0 1 13 0v9l-2.2-1.6-2.1 1.6-2.2-1.6-2.1 1.6-2.2-1.6z" />}
  >
    <path d="M5.5 20V11a6.5 6.5 0 0 1 13 0v9l-2.2-1.6-2.1 1.6-2.2-1.6-2.1 1.6-2.2-1.6z" />
    <path d="M9.6 10.5h.01M14.4 10.5h.01" />
  </Duo>
)

/**
 * Hole flag
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfFlagGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M8 3.5 17.5 7 8 10.5z" />}>
    <path d="M8 20.5V3.5L17.5 7 8 10.5" />
    <ellipse cx="9" cy="20.2" rx="4.5" ry="1.3" />
  </Duo>
)

/**
 * Strokes played
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfStrokeGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="16.5" cy="17" r="3" />}>
    <path d="M4.5 3.5 12 15.5l-3.2 1.6" />
    <circle cx="16.5" cy="17" r="3" />
  </Duo>
)

/**
 * Whole hole from above
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfOverviewGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />}>
    <path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13" />
  </Duo>
)

/**
 * Camera on the ball
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfFollowGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="12" cy="12" r="4" />}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </Duo>
)

/**
 * Sound on
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfSoundGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  </Duo>
)

/**
 * Sound off
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfMuteGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9.5l5 5M20.5 9.5l-5 5" />
  </Duo>
)
