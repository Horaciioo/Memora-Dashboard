import { Frame } from '@/components/elements/display/glyphs/BrandGlyphs'
import type { GlyphProps } from '@/components/elements/display/glyphs/BrandGlyphs'

/**
 * Dot following the colour of its words
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const StatusDotGlyph = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.22" />
    <circle cx="12" cy="12" r="5.5" fill="currentColor" />
  </svg>
)

/**
 * Red dot of a live
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveDotGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, deep }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={deep} opacity="0.25" />
        <circle cx="12" cy="12" r="6.4" fill={fill} />
        <circle cx="10.4" cy="10.2" r="2.6" fill={lift} opacity="0.85" />
      </>
    )}
  />
)

/**
 * Twitch speech mark
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TwitchGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="TWITCH"
    render={({ fill, lift, cut }) => (
      <>
        <path d="M4.5 2.5h16v11l-5 5h-4l-3 3v-3h-4z" fill={fill} />
        <path d="M4.5 2.5h16v4h-16z" fill={lift} opacity="0.55" />
        <path d="M11 7.5v4.5M15.5 7.5v4.5" stroke={cut} strokeWidth="2" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * YouTube play button, raised on a dark plinth
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const YoutubeGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="YOUTUBE"
    render={({ fill, lift, deep, cut }) => (
      <>
        <rect x="1.8" y="6.4" width="20.4" height="14" rx="5.2" fill={deep} />
        <rect x="1.8" y="3.8" width="20.4" height="14.6" rx="5.2" fill={fill} />
        <path
          d="M1.8 9A5.2 5.2 0 0 1 7 3.8h10A5.2 5.2 0 0 1 22.2 9v.8C17 8 7 8 1.8 9.8z"
          fill={lift}
          opacity="0.55"
        />
        <path
          d="M10.2 7.9v6.8l6.2-3.4z"
          fill={deep}
          stroke={deep}
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.45"
          transform="translate(.5 .7)"
        />
        <path
          d="M10.2 7.9v6.8l6.2-3.4z"
          fill={cut}
          stroke={cut}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <ellipse
          cx="5.6"
          cy="7.4"
          rx="1.6"
          ry="0.8"
          transform="rotate(-25 5.6 7.4)"
          fill="white"
          opacity="0.8"
        />
      </>
    )}
  />
)

/**
 * Live coordinator flag
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const CoordinatorGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="COORDINATOR"
    render={({ fill, lift, deep }) => (
      <>
        <path d="M5 2.5v19" stroke={deep} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M6 3.5h13l-3 4.5 3 4.5H6z" fill={fill} />
        <path d="M6 3.5h13l-3 4.5H6z" fill={lift} opacity="0.6" />
      </>
    )}
  />
)

/**
 * Twitch moderator badge, the green sword
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TwitchModBadge = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 16 16" className={className} role="img" aria-label="Modérateur">
    <rect width="16" height="16" rx="2" fill="var(--chat-moderator)" />
    <path
      d="M12.6 3.4 8 8M4.6 10.4l1.8 1.8M5.4 11.2 3.4 13.2M6.8 6.2l3 3"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)
