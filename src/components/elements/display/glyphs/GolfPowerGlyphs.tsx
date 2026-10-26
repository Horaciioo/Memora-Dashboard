import type { GlyphProps } from '@/components/elements/display/glyphs/Glyphs'
import { Duo } from '@/components/elements/display/glyphs/PlayGlyphs'

// Golf powers of the refonte, same duotone

/**
 * Gust power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfGustGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="19" cy="12" r="2.5" />}>
    <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h13M3 16h8a2.5 2.5 0 1 1-2.5 2.5" />
    <circle cx="19" cy="12" r="2.5" />
  </Duo>
)

/**
 * Cosmic fart power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfFartGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={<path d="M6 17a4 4 0 0 1 1-7.8A5 5 0 0 1 16.6 8 4 4 0 0 1 18 17z" />}
  >
    <path d="M6 17a4 4 0 0 1 1-7.8A5 5 0 0 1 16.6 8 4 4 0 0 1 18 17z" />
    <path d="M8 20.5h.01M12 21h.01M16 20.5h.01" />
  </Duo>
)

/**
 * Prank turbo power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfTurboGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
  </Duo>
)

/**
 * Flash power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfFlashGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={<path d="M14 3.5 15.8 9l5.7 1.8-5.7 1.8L14 18l-1.8-5.4-5.7-1.8L12.2 9z" />}
  >
    <path d="M14 3.5 15.8 9l5.7 1.8-5.7 1.8L14 18l-1.8-5.4-5.7-1.8L12.2 9z" />
    <path d="M2.5 14h4M3.5 18h5M2.5 10h2" />
  </Duo>
)

/**
 * Steady hand power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfSteadyGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="12" cy="12" r="7.5" />}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Duo>
)

/**
 * Twisted arrow power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfTwistGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="12" cy="12" r="7" />}>
    <path d="M19 12a7 7 0 1 1-2.05-4.95" />
    <path d="M17.5 3.5V7.5h-4" />
  </Duo>
)

/**
 * Mirror power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfMirrorGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M12 4v16" />}>
    <path d="M12 3v18M9 8 4 12l5 4M15 8l5 4-5 4" />
  </Duo>
)

/**
 * Blind shot power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfBlindGlyph = ({ className }: GlyphProps) => (
  <Duo
    className={className}
    tint={<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />}
  >
    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
    <path d="M4 4l16 16" />
  </Duo>
)

/**
 * Lob power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfLobGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="19" cy="17.5" r="2" />}>
    <path d="M3 19c3-14 11-14 14-3" strokeDasharray="2 2.4" />
    <circle cx="19" cy="17.5" r="2" />
  </Duo>
)

/**
 * Swap power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfSwapGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<circle cx="6" cy="6" r="2.5" />}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M10 6h8l-2.5-2.5M14 18H6l2.5 2.5" />
  </Duo>
)

/**
 * Ice power
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const GolfIceGlyph = ({ className }: GlyphProps) => (
  <Duo className={className} tint={<path d="M12 7.5 16 12l-4 4.5L8 12z" />}>
    <path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5" />
    <path d="M9.5 4.6 12 6.8l2.5-2.2M9.5 19.4 12 17.2l2.5 2.2M5.2 10.4l3.3-.3-.9-3.2M18.8 13.6l-3.3.3.9 3.2M5.2 13.6l3.3.3-.9 3.2M18.8 10.4l-3.3-.3.9-3.2" />
  </Duo>
)
