import { useId } from 'react'
import type { ReactNode } from 'react'
import { RampStops } from '@/components/elements/display/glyphs/RampStops'
import { visionSafe } from '@/utils/format/colour'
import { DIVISION_TIERS } from '@/declarations/members/divisions'
import type { DivisionTier } from '@/declarations/members/divisions'
import { GLYPH_TINTS, JUNIOR_TINTS } from '@/declarations/members/tints'
import type { GlyphTint } from '@/declarations/members/tints'
import { BRAND_RAMP } from '@/declarations/ui/ramps'

// GlyphProps
export interface GlyphProps {
  className?: string
}

// Tone ramp per shape
export type Paints = { fill: string; lift: string; deep: string; cut: string }

// Stops of each ramp
const FRAME_RAMPS = {
  brand: BRAND_RAMP,
  success: {
    fillFrom: 'color-mix(in oklab, var(--color-success) 70%, var(--color-on-media))',
    fillTo: 'var(--color-success)',
    liftFrom: 'color-mix(in oklab, var(--color-success) 25%, var(--color-on-media))',
    liftTo: 'color-mix(in oklab, var(--color-success) 55%, var(--color-on-media))',
    deepFrom: 'var(--color-success)',
    deepTo: 'color-mix(in oklab, var(--color-success) 70%, var(--color-media-shade))',
    cut: 'var(--color-success-soft)',
  },
  caution: {
    fillFrom: 'color-mix(in oklab, var(--color-caution) 70%, var(--color-on-media))',
    fillTo: 'var(--color-caution)',
    liftFrom: 'color-mix(in oklab, var(--color-caution) 25%, var(--color-on-media))',
    liftTo: 'color-mix(in oklab, var(--color-caution) 55%, var(--color-on-media))',
    deepFrom: 'var(--color-caution)',
    deepTo: 'color-mix(in oklab, var(--color-caution) 70%, var(--color-media-shade))',
    cut: 'var(--color-caution-soft)',
  },
  danger: {
    fillFrom: 'color-mix(in oklab, var(--color-danger) 70%, var(--color-on-media))',
    fillTo: 'var(--color-danger)',
    liftFrom: 'color-mix(in oklab, var(--color-danger) 25%, var(--color-on-media))',
    liftTo: 'color-mix(in oklab, var(--color-danger) 55%, var(--color-on-media))',
    deepFrom: 'var(--color-danger)',
    deepTo: 'color-mix(in oklab, var(--color-danger) 70%, var(--color-media-shade))',
    cut: 'var(--color-danger-soft)',
  },
  // Role and function tints
  ...GLYPH_TINTS,
  ...JUNIOR_TINTS,
  brand_JUNIOR: BRAND_RAMP,
}

export type FrameTone = keyof typeof FRAME_RAMPS

/**
 * Wraps a drawing in a 24 square with the shared three-tone ramp
 * @param {Object} props - Sizing class
 * @return {JSX.Element}
 */

export const Frame = ({
  className,
  tone = 'brand',
  render,
}: GlyphProps & { tone?: FrameTone; render: (paints: Paints) => ReactNode }) => {
  const scope = useId()
  const fillId = `${scope}-fill`
  const liftId = `${scope}-lift`
  const deepId = `${scope}-deep`
  const ramp: GlyphTint = FRAME_RAMPS[tone]

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={fillId} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <RampStops colours={[ramp.fillFrom, ramp.fillMid, ramp.fillTo]} />
        </linearGradient>
        <linearGradient id={liftId} x1="6" y1="3" x2="18" y2="15" gradientUnits="userSpaceOnUse">
          <RampStops colours={[ramp.liftFrom, ramp.liftMid, ramp.liftTo]} />
        </linearGradient>
        <linearGradient id={deepId} x1="6" y1="10" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <RampStops colours={[ramp.deepFrom, ramp.deepMid, ramp.deepTo]} />
        </linearGradient>
      </defs>
      {render({
        fill: `url(#${fillId})`,
        lift: `url(#${liftId})`,
        deep: `url(#${deepId})`,
        cut: ramp.cut.startsWith('#') ? visionSafe(ramp.cut) : ramp.cut,
      })}
    </svg>
  )
}

/**
 * System
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SystemGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <rect x="3" y="4" width="18" height="12.5" rx="2.5" fill={fill} />
        <rect x="3" y="4" width="18" height="4" rx="2.5" fill={lift} />
        <path
          d="M9 20.5h6M12 16.5v4"
          fill="none"
          stroke={deep}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Dark
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DarkGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" fill={fill} />
        <circle cx="15.3" cy="8.7" r="1" fill={lift} />
        <circle cx="17.4" cy="12" r="0.8" fill={lift} />
      </>
    )}
  />
)

/**
 * Light
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LightGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
          fill="none"
          stroke={fill}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="5" fill={fill} />
        <circle cx="10.5" cy="10.5" r="1.6" fill={lift} />
      </>
    )}
  />
)

/**
 * Livecon
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveconGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.7 4.7a10.3 10.3 0 0 0 0 14.6M19.3 4.7a10.3 10.3 0 0 1 0 14.6"
          fill="none"
          stroke={lift}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" fill={fill} />
      </>
    )}
  />
)

/**
 * Lead
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LeadGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <path d="M3 14a9 9 0 0 1 18 0z" fill={fill} />
        <path d="m12 14 4.5-4.5" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="14" r="1.6" fill={deep} />
      </>
    )}
  />
)

/**
 * Youtuber
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const YoutuberGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="2.5" y="4.5" width="19" height="13" rx="2.5" fill={fill} />
        <rect x="9.5" y="19" width="5" height="2" rx="1" fill={lift} />
        <path d="M10 8.5v6l5.5-3z" fill={cut} />
      </>
    )}
  />
)

/**
 * Youtuber off
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const YoutuberNoneGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <rect x="2.5" y="4.5" width="19" height="13" rx="2.5" fill={fill} opacity="0.55" />
        <rect x="9.5" y="19" width="5" height="2" rx="1" fill={lift} />
        <path d="M4 3.5 20 19.5" stroke={deep} strokeWidth="2.2" strokeLinecap="round" />
      </>
    )}
  />
)

// Discord logo outline, eye holes included
const DISCORD_LOGO =
  'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z'

/**
 * Discord logo in three tones, clear eyes and a light volume
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordGlyph = ({ className }: GlyphProps) => {
  const clip = useId()

  return (
    <Frame
      className={className}
      tone="DISCORD"
      render={({ fill, lift, deep, cut }) => (
        <>
          <defs>
            <clipPath id={clip}>
              <path d={DISCORD_LOGO} />
            </clipPath>
          </defs>
          <g transform="translate(1.4 1.6) scale(.88)">
            <path d={DISCORD_LOGO} fill={fill} />
            <g clipPath={`url(#${clip})`}>
              <path d="M0 0H24V8.4C15 5.4 7 6.4 0 11.6z" fill={lift} opacity="0.5" />
              <path d="M0 17.8C8 20.6 16 20.6 24 17.4V24H0z" fill={deep} opacity="0.55" />
            </g>
            <ellipse cx="8.02" cy="12.91" rx="2.1" ry="2.35" fill={cut} />
            <ellipse cx="15.99" cy="12.91" rx="2.1" ry="2.35" fill={cut} />
          </g>
        </>
      )}
    />
  )
}

// Role glyphs take the tint of the function they carry
interface TintedGlyphProps extends GlyphProps {
  tone?: FrameTone
}

/**
 * Moderator, bevelled shield with a raised check
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const ModeratorGlyph = ({ className, tone = 'DIVISION' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M3.6 4.9Q7.8 5.3 12 2.2q4.2 3.1 8.4 2.7v6.7C20.4 16.6 16.8 20.2 12 22 7.2 20.2 3.6 16.6 3.6 11.6z"
          fill={deep}
          stroke={deep}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <path
          d="M5.1 6.4Q8.5 6.6 12 4.2q3.5 2.4 6.9 2.2v5.1c0 4-2.9 7-6.9 8.6-4-1.6-6.9-4.6-6.9-8.6z"
          fill={fill}
          stroke={fill}
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path d="M12 4.2Q8.5 6.6 5.1 6.4v5.1c0 4 2.9 7 6.9 8.6z" fill={lift} opacity="0.5" />
        <path d="M12 4.2q3.5 2.4 6.9 2.2v5.1c0 4-2.9 7-6.9 8.6z" fill={deep} opacity="0.3" />
        <path
          d="M6.4 7.7Q9 7.6 12 5.5"
          fill="none"
          stroke="white"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="m8.6 12.1 2.4 2.5 4.5-5.2"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
          transform="translate(.4 .6)"
        />
        <path
          d="m8.6 12.1 2.4 2.5 4.5-5.2"
          fill="none"
          stroke={cut}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Junior, black mortarboard with a tinted cord
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const JuniorGlyph = ({ className, tone = 'brand' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill }) => (
      <>
        <path d="M6.3 11.2v4.3c0 2.3 11.4 2.3 11.4 0v-4.3L12 13.9z" fill="#1b1b20" />
        <path d="M2 8.6 12 13.4 22 8.6v1.7L12 15.1 2 10.3z" fill="#101013" />
        <path d="M12 3.9 22 8.6 12 13.4 2 8.6z" fill="#2a2a30" />
        <path d="M12 3.9 22 8.6 12 8.6z" fill="#fff" opacity="0.13" />
        <path
          d="M12 8.6 19.6 9.9v5"
          fill="none"
          stroke={fill}
          strokeWidth="0.95"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="8.6" r="1.15" fill={fill} />
        <path d="M19.6 14.6v4.2" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Junior Discord function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const JuniorDiscordFunctionGlyph = ({ className }: GlyphProps) => (
  <JuniorGlyph className={className} tone="DISCORD_JUNIOR" />
)

/**
 * Junior Live function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const JuniorLiveFunctionGlyph = ({ className }: GlyphProps) => (
  <JuniorGlyph className={className} tone="LIVE_JUNIOR" />
)

/**
 * Junior Animator function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const JuniorAnimatorFunctionGlyph = ({ className }: GlyphProps) => (
  <JuniorGlyph className={className} tone="ANIMATOR_JUNIOR" />
)

/**
 * Junior lead function, burning orange
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const JuniorLeadFunctionGlyph = ({ className }: GlyphProps) => (
  <JuniorGlyph className={className} tone="RESPONSABLE_JUNIOR" />
)

/**
 * Discord moderator function, the Discord logo
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordFunctionGlyph = ({ className }: GlyphProps) => (
  <DiscordGlyph className={className} />
)

/**
 * Live moderator function, a green sword like the Twitch moderator badge
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="LIVE"
    render={({ fill, lift, deep }) => (
      <>
        <g transform="rotate(45 12 12)">
          <path
            d="M12 .6 14.2 3.2v11.4H9.8V3.2z"
            fill={fill}
            stroke={fill}
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <path d="M12 .6 9.8 3.2v11.4H12z" fill={lift} opacity="0.8" />
          <path
            d="M12 4.2v9.2"
            stroke={deep}
            strokeWidth="0.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <rect x="5.6" y="14.2" width="12.8" height="2.6" rx="1.3" fill={deep} />
          <path
            d="M6.8 14.9h10.4"
            stroke={lift}
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="5.9" cy="15.5" r="1.3" fill={fill} />
          <circle cx="18.1" cy="15.5" r="1.3" fill={fill} />
          <rect x="10.8" y="16.8" width="2.4" height="4" rx="0.8" fill={fill} />
          <path d="M10.8 18.2h2.4M10.8 19.7h2.4" stroke={deep} strokeWidth="0.5" opacity="0.6" />
          <circle cx="12" cy="21.8" r="1.5" fill={deep} />
          <circle cx="11.5" cy="21.3" r="0.45" fill={lift} />
        </g>
      </>
    )}
  />
)

/**
 * Recruiter function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const RecruiterFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="RECRUITER"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="m15.2 15.2 5.6 5.6" stroke={deep} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="10" cy="10" r="7" fill={fill} />
        <circle cx="10" cy="10" r="5.1" fill={lift} />
        <circle cx="10" cy="8.4" r="1.9" fill={deep} />
        <path d="M6.7 13.5c.6-1.8 1.9-2.7 3.3-2.7s2.7.9 3.3 2.7a5.1 5.1 0 0 1-6.6 0z" fill={deep} />
        <path
          d="M6.2 7.2a4.6 4.6 0 0 1 2.2-2"
          fill="none"
          stroke={cut}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Academy trainer function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TrainerFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="TRAINER"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M6 11.4v4.2c0 1.9 2.7 3.6 6 3.6s6-1.7 6-3.6v-4.2l-6 3z" fill={deep} />
        <path d="M12 4 22 9l-10 5L2 9z" fill={fill} />
        <path d="M12 4 22 9l-10 5z" fill={lift} opacity="0.45" />
        <path d="M20 9.4v5.6" stroke={deep} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="20" cy="15.8" r="1.3" fill={deep} />
        <circle cx="12" cy="9" r="0.9" fill={cut} />
      </>
    )}
  />
)

/**
 * Observer function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ObserverFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="OBSERVER"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M1.8 12C4.2 7.4 8 5.2 12 5.2s7.8 2.2 10.2 6.8c-2.4 4.6-6.2 6.8-10.2 6.8S4.2 16.6 1.8 12z"
          fill={fill}
        />
        <path d="M1.8 12C4.2 7.4 8 5.2 12 5.2s7.8 2.2 10.2 6.8z" fill={lift} opacity="0.5" />
        <circle cx="12" cy="12" r="4.4" fill={cut} />
        <circle cx="12" cy="12" r="2.7" fill={deep} />
        <circle cx="13" cy="11" r="0.9" fill={cut} />
      </>
    )}
  />
)

/**
 * Animateur function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const AnimatorFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="ANIMATOR"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M2.8 21.2 8 9.2l6.8 6.8z" fill={fill} />
        <path
          d="M4.4 18.4 7.9 10.6"
          stroke={cut}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path d="M4.3 17.7 5.6 14.7l3.7 3.7-3 1.3zM6.6 12.4l.9-2 6 6-2 .9z" fill={lift} />
        <ellipse
          cx="11.4"
          cy="12.6"
          rx="4.8"
          ry="1.6"
          transform="rotate(45 11.4 12.6)"
          fill={deep}
        />
        <path
          d="M12.6 8.4c.5-1.9 2.1-2.1 2.3-3.7.2-1.4 1.6-2 2.7-1.3"
          fill="none"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15.6 12.6c1.7-.7 2.5.9 4.2-.1"
          fill="none"
          stroke={deep}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="19.6" cy="6.6" r="1.1" fill={fill} />
        <circle cx="21" cy="10.2" r="0.8" fill={deep} />
        <circle cx="16.8" cy="9.4" r="0.7" fill={lift} />
        <rect
          x="9.4"
          y="3"
          width="1.6"
          height="2.8"
          rx="0.5"
          transform="rotate(25 10.2 4.4)"
          fill={deep}
        />
        <rect
          x="19"
          y="15.2"
          width="1.6"
          height="2.8"
          rx="0.5"
          transform="rotate(-30 19.8 16.6)"
          fill={fill}
        />
      </>
    )}
  />
)

// Embers popping beside the flame: x, y, radius, beat
const FLAME_EMBERS: [number, number, number, number][] = [
  [19.8, 5.4, 0.55, 0],
  [4.2, 3.8, 0.45, 1],
  [15.4, 1.8, 0.5, 2],
]

/**
 * Responsable, a flame that flickers and throws embers
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const ResponsableGlyph = ({ className, tone = 'RESPONSABLE' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
        <g className="glyph-flicker">
          <path
            d="M5.4 5.6c-1.4 1.5-1.9 3.3-1.2 5 .4-.9 1.1-1.5 2-1.8-.6-1-.9-2.1-.8-3.2z"
            fill={fill}
          />
          <path
            d="M12 1.6c.6 2.6 3.2 4.3 4.9 6.8 1.3 1.9 2.4 3.9 2.4 6.5 0 4.2-3.2 7.5-7.3 7.5s-7.3-3.3-7.3-7.3c0-2.5 1.1-4.5 2.5-6 .2 1.4.9 2.5 1.9 3-.3-3.7 1.1-7.7 2.9-10.5z"
            fill={fill}
          />
          <path
            d="M16.9 8.4c1.3 1.9 2.4 3.9 2.4 6.5 0 4.2-3.2 7.5-7.3 7.5 3-1 5.3-3.8 5.3-7.2 0-2.4-.7-4.6-.4-6.8z"
            fill={deep}
            opacity="0.55"
          />
        </g>
        <g className="glyph-flicker" data-beat="1">
          <path
            d="M12 8.2c.5 2 2.6 3.4 3.6 5.4.5 1 .8 1.9.8 3 0 2.7-2 4.7-4.4 4.7s-4.4-2-4.4-4.5c0-1.5.7-2.7 1.7-3.6.2.9.7 1.5 1.3 1.8-.2-2.3.3-4.8 1.4-6.8z"
            fill={lift}
          />
          <path
            d="M12 13.2c.4 1.4 1.8 2.4 2.2 3.9.2.6.2 1.2.1 1.7-.3 1.2-1.2 2-2.3 2-1.3 0-2.3-1-2.3-2.3 0-1.1.6-1.9 1.3-2.5.1.6.4 1 .7 1.2-.2-1.4-.2-2.8.3-4z"
            fill={cut}
          />
        </g>
        {FLAME_EMBERS.map(([x, y, r, beat]) => (
          <circle
            key={`${x}-${y}`}
            className="glyph-ember"
            data-beat={beat}
            cx={x}
            cy={y}
            r={r}
            fill={lift}
          />
        ))}
      </>
    )}
  />
)

// Crown silhouette, five rounded spikes over a wide curved band
const CROWN_BODY =
  'M4.3 19.6 3.1 9l.8-.8Q5.4 16 6.9 7.2h1.6Q9.5 14 10.8 5.6h2.4q1.3 8.4 2.3 1.6h1.6q1.5 8.8 3 1l.8.8-1.2 10.6C15.6 21 8.4 21 4.3 19.6z'
const CROWN_TIPS: [number, number, number][] = [
  [3.4, 7.2, 1.8],
  [20.6, 7.2, 1.8],
  [7.7, 5.2, 1.65],
  [16.3, 5.2, 1.65],
  [12, 3.3, 2.15],
]

// Sparkles beside the crown: x, y, size, beat
const CROWN_SPARKLES: [number, number, number, number][] = [
  [3, 4.4, 1, 0],
  [21.2, 14.6, 0.78, 1],
  [20.4, 3.2, 0.5, 2],
]

/**
 * Glossy pearl on a crown spike
 * @param {Paints} paints - Ramp paints
 * @param {number[]} tip - Centre x, centre y and radius
 * @param {number} beat - Order the gloss pulses in
 * @return {JSX.Element}
 */

const pearl = ({ lift, deep }: Paints, [x, y, r]: number[], beat: number) => (
  <g key={`${x}-${y}`}>
    <circle cx={x} cy={y} r={r} fill={lift} stroke={deep} strokeWidth="0.7" />
    <ellipse
      cx={x - r * 0.35}
      cy={y - r * 0.4}
      rx={r * 0.32}
      ry={r * 0.24}
      transform={`rotate(-35 ${x - r * 0.35} ${y - r * 0.4})`}
      className="glyph-gloss"
      data-beat={beat % 3}
      fill="white"
      opacity="0.95"
    />
  </g>
)

/**
 * Admin crown, cartoon pearls and a few sparkles that twinkle
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const AdminGlyph = ({ className, tone = 'ADMIN' }: TintedGlyphProps) => {
  const clip = useId()

  return (
    <Frame
      className={className}
      tone={tone}
      render={(paints) => {
        const { fill, lift, deep } = paints

        return (
          <>
            <g transform="translate(12 13.4) scale(.8) translate(-12 -12)">
              <path
                d={CROWN_BODY}
                fill={fill}
                stroke={deep}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />
              <path
                d="M19.7 19.6C15.6 21 8.4 21 4.3 19.6 9 19.4 17 18.6 20.4 14.6z"
                fill={deep}
                opacity="0.5"
              />
              <path
                d="M11.4 7.4C11.4 10 11 12.2 10.2 13.4"
                fill="none"
                stroke={lift}
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.85"
              />
              {CROWN_TIPS.map((tip, index) => pearl(paints, tip, index))}
              <ellipse
                cx="6.6"
                cy="16.4"
                rx="1.5"
                ry="1.05"
                transform="rotate(-20 6.6 16.4)"
                fill="white"
                opacity="0.9"
              />
              <circle cx="9" cy="15.6" r="0.48" fill="white" opacity="0.9" />
              <defs>
                <clipPath id={clip}>
                  <path d={CROWN_BODY} />
                </clipPath>
              </defs>
              <g clipPath={`url(#${clip})`}>
                <path className="glyph-shine" d="M2 0h3.6L1.6 24H-2z" fill="white" />
              </g>
            </g>
            {CROWN_SPARKLES.map(([x, y, size, beat]) => (
              <g key={`${x}-${y}`} className="glyph-twinkle" data-beat={beat}>
                <path
                  transform={`translate(${x} ${y}) scale(${size})`}
                  d="M0-2.4Q.4-.4 2.4 0 .4.4 0 2.4-.4.4-2.4 0-.4-.4 0-2.4z"
                  fill={lift}
                  stroke={deep}
                  strokeWidth="0.35"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </>
        )
      }}
    />
  )
}

/**
 * Livecon 3
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveconCalmGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="success"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M5 19C4.2 11 9 4.5 20 4c.4 10.6-6 15.6-15 15z" fill={fill} />
        <path d="M5 19C4.6 13 8 7.6 16 6c-4 3-7.4 7.4-11 13z" fill={lift} />
        <path
          d="M5 19c3.6-5.6 7-9.4 11.5-12.4"
          fill="none"
          stroke={cut}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M5 19c-.8.8-1.6 1.6-2.2 2.2"
          fill="none"
          stroke={deep}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Livecon 2
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveconWatchGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="caution"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M10.3 3.9a2 2 0 0 1 3.4 0l8 13.8a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3z" fill={fill} />
        <path d="M10.3 3.9a2 2 0 0 1 3.4 0L12 7 5.5 18.3H3.4a2 2 0 0 1-1.1-.6z" fill={lift} />
        <path d="M21.7 17.7a2 2 0 0 1-1.7 3H4l.6-1.4h15.8z" fill={deep} opacity="0.5" />
        <path d="M12 9v5" fill="none" stroke={cut} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="17.1" r="1.25" fill={cut} />
      </>
    )}
  />
)

/**
 * Livecon 1
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveconCrisisGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M12 1.5l2.2 3.9 4.2-1.6-.6 4.5 4.4 1.3-3 3.4 2.6 3.7-4.5.5.3 4.5-4-2.1L12 22.5l-2.5-3.6-4 2.1.3-4.5-4.5-.5 2.6-3.7-3-3.4 4.4-1.3-.6-4.5 4.2 1.6z"
          fill={fill}
        />
        <path
          d="M12 1.5l2.2 3.9 4.2-1.6-.6 4.5L12 12 6.2 8.3l-.6-4.5 4.2 1.6z"
          fill={lift}
          opacity="0.7"
        />
        <circle cx="12" cy="12" r="5.2" fill={deep} opacity="0.35" />
        <path d="M12 8v5" fill="none" stroke={cut} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.3" fill={cut} />
      </>
    )}
  />
)

// Shield outline, inner face and double rim
const SHIELD_RIM = 'M12 1.6 21.2 4.4V12.2c0 5.2-3.7 8.6-9.2 10.6C6.5 20.8 2.8 17.4 2.8 12.2V4.4z'
const SHIELD_FACE = 'M12 3.4 19.4 5.7V12c0 4.3-3 7.2-7.4 8.9C7.6 19.2 4.6 16.3 4.6 12V5.7z'
const SHIELD_GILT = 'M12 .6 22 3.7V12.2c0 5.6-4 9.3-10 11.4C6 21.5 2 17.8 2 12.2V3.7z'

// Chevron half-width and spacing per count
const CHEVRON_SIZES: Record<number, [number, number, number]> = {
  1: [5.2, 0, 2.2],
  2: [4.8, 3.6, 2.2],
  3: [4.4, 3.2, 1.9],
  4: [4, 2.8, 1.6],
}

/**
 * Chevron strokes stacked like galons
 * @param {DivisionTier} tier - Tier drawn
 * @param {Paints} paints - Ramp paints
 * @return {JSX.Element[]} - Strokes
 */

const galons = ({ chevrons, hollow }: DivisionTier, { cut, deep }: Paints) => {
  const [half, gap, width] = CHEVRON_SIZES[chevrons]

  return Array.from({ length: chevrons }, (_, index) => {
    const y = 13.2 + (index - (chevrons - 1) / 2) * gap
    const d = `M${12 - half} ${y + half / 2}L12 ${y - half / 2}L${12 + half} ${y + half / 2}`
    const stroke = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

    // Hollow: the face shows through the outline
    return hollow ? (
      <g key={index}>
        <path d={d} {...stroke} stroke={cut} strokeWidth={width + 0.5} />
        <path d={d} {...stroke} stroke={deep} strokeWidth={width - 1} opacity="0.55" />
      </g>
    ) : (
      <g key={index}>
        <path
          d={d}
          {...stroke}
          stroke={deep}
          strokeWidth={width}
          opacity="0.85"
          transform="translate(.45 .65)"
        />
        <path d={d} {...stroke} stroke={cut} strokeWidth={width} />
        <path
          d={d}
          {...stroke}
          stroke="white"
          strokeWidth={width * 0.32}
          opacity="0.8"
          transform="translate(-.2 -.25)"
        />
      </g>
    )
  })
}

/**
 * Escutcheon of a division, one more galon at each rank
 * @param {Object} props - Sizing class and tier index
 * @return {JSX.Element}
 */

export const DivisionCrest = ({ className, tier }: GlyphProps & { tier: number }) => {
  const config = DIVISION_TIERS[tier]

  return (
    <Frame
      className={className}
      tone={config.tone}
      render={(paints) => {
        const { fill, lift, deep, cut } = paints

        return (
          <>
            {config.double && (
              <path
                d={SHIELD_GILT}
                fill="none"
                stroke={lift}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            )}
            <path d={SHIELD_RIM} fill={deep} stroke={deep} strokeWidth="1" strokeLinejoin="round" />
            <path
              d={SHIELD_FACE}
              fill={fill}
              stroke={fill}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            <path d="M12 3.4 4.6 5.7V12c0 4.3 3 7.2 7.4 8.9z" fill={lift} opacity="0.4" />
            <path d="M12 3.4 19.4 5.7V12c0 4.3-3 7.2-7.4 8.9z" fill={deep} opacity="0.28" />
            <path
              d="M5.4 6.4 12 4.3l6.6 2.1"
              fill="none"
              stroke={cut}
              strokeWidth="0.6"
              strokeLinecap="round"
              opacity="0.7"
            />
            {galons(config, paints)}
          </>
        )
      }}
    />
  )
}

/**
 * Briefcase of the employee
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const EmployeGlyph = ({ className, tone = 'EMPLOYE' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M8.9 8.4V6.4a1.9 1.9 0 0 1 1.9-1.9h2.4a1.9 1.9 0 0 1 1.9 1.9v2"
          fill="none"
          stroke={deep}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <rect x="2.8" y="7.8" width="18.4" height="13.2" rx="3" fill={fill} />
        <path
          d="M5.8 7.8h6.6c-2 2.2-3.2 4.6-3.6 7H2.8v-4a3 3 0 0 1 3-3z"
          fill={lift}
          opacity="0.5"
        />
        <path d="M2.8 13.6h18.4V18a3 3 0 0 1-3 3H5.8a3 3 0 0 1-3-3z" fill={deep} />
        <path d="M2.8 13.6h18.4" stroke={cut} strokeWidth="0.6" opacity="0.5" />
        <rect x="10.2" y="11.9" width="3.6" height="3.6" rx="1" fill={cut} />
        <circle cx="12" cy="13.7" r="0.7" fill={deep} />
      </>
    )}
  />
)
