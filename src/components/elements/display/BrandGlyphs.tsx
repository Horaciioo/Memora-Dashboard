import { useId } from 'react'
import type { ReactNode } from 'react'
import { RampStops } from '@/components/elements/display/RampStops'
import { GLYPH_TINTS } from '@/declarations/members/tints'
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
        cut: ramp.cut,
      })}
    </svg>
  )
}

/**
 * Heavy cross of a task waiting
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const CrossGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="danger"
    render={({ fill, lift, deep }) => (
      <>
        <path d="M6 6 18 18" fill="none" stroke={deep} strokeWidth="3.6" strokeLinecap="round" />
        <path d="M18 6 6 18" fill="none" stroke={fill} strokeWidth="4" strokeLinecap="round" />
        <path
          d="M16.2 7.8 14 10"
          fill="none"
          stroke={lift}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Heavy check of a chosen entry
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const CheckGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="success"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M4.4 12.6 9.4 17.6"
          fill="none"
          stroke={deep}
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <path
          d="M9.4 17.6 19.8 5.6"
          fill="none"
          stroke={fill}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M14.3 10.6 17.9 6.5"
          fill="none"
          stroke={lift}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle cx="19.4" cy="5.9" r="0.6" fill={cut} opacity="0.8" />
      </>
    )}
  />
)

/**
 * Accueil
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const AccueilGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M3.5 11.5 12 4l8.5 7.5"
          fill="none"
          stroke={fill}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="6" y="11" width="12" height="10" rx="1.5" fill={lift} />
        <rect x="10" y="15" width="4" height="6" rx="1" fill={cut} />
      </>
    )}
  />
)

/**
 * Absences
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const AbsencesGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <rect x="3.5" y="8" width="17" height="12" rx="2.5" fill={fill} />
        <rect x="8.5" y="4.5" width="7" height="4" rx="1.5" fill={lift} />
        <rect x="3.5" y="8" width="17" height="3.4" fill={deep} />
        <rect x="10.5" y="13" width="3" height="3" rx="0.8" fill={cut} />
      </>
    )}
  />
)

/**
 * Meetings
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const MeetingsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="3.5" y="5" width="17" height="16" rx="3.5" fill={fill} />
        <rect x="3.5" y="5" width="17" height="5" rx="3.5" fill={lift} />
        <rect x="7" y="2.5" width="2.4" height="5" rx="1.2" fill={fill} />
        <rect x="14.6" y="2.5" width="2.4" height="5" rx="1.2" fill={fill} />
        <circle cx="12" cy="15" r="2.6" fill={cut} />
      </>
    )}
  />
)

/**
 * Academy
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const AcademyGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M12 4 21 8.5l-9 4.5-9-4.5z" fill={fill} />
        <path d="M7 10.5v4c0 1.8 2.2 3.2 5 3.2s5-1.4 5-3.2v-4l-5 2.5z" fill={lift} />
        <path d="M20 9v5.5" stroke={deep} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="15.2" r="1.3" fill={deep} />
      </>
    )}
  />
)

/**
 * Members
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const MembersGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <circle cx="15.5" cy="8" r="3" fill={lift} />
        <path d="M10.5 21c0-3.6 2.4-6 5.5-6s5.5 2.4 5.5 6z" fill={lift} />
        <circle cx="9" cy="7.5" r="3.6" fill={fill} />
        <path d="M2.5 21c0-4 3-7 7-7s7 3 7 7z" fill={fill} />
      </>
    )}
  />
)

/**
 * Projects
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ProjectsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="M3 7.5A1.5 1.5 0 0 1 4.5 6h5l2 2h8A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5z"
          fill={fill}
        />
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h5l1.6 1.6H3z" fill={lift} />
      </>
    )}
  />
)

/**
 * Tasks
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TasksGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <rect x="4" y="5" width="6" height="6" rx="1.4" fill={fill} />
        <path
          d="m5.2 8 1.2 1.2 2-2.4"
          fill="none"
          stroke={cut}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="12" y="6.8" width="8" height="2.4" rx="1.2" fill={fill} />
        <rect x="4" y="14" width="6" height="6" rx="1.4" fill={deep} />
        <rect x="12" y="15.8" width="8" height="2.4" rx="1.2" fill={deep} />
      </>
    )}
  />
)

/**
 * Recruitment
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const RecruitmentGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M4 4h16v10h-5l-1.5 2.5h-3L9 14H4z" fill={fill} />
        <path d="M4 14h5l1.5 2.5h3L15 14h5v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill={lift} />
        <circle cx="18" cy="5.5" r="3.4" fill={deep} />
        <path d="M18 4v3M16.5 5.5h3" stroke={cut} strokeWidth="1.3" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Sanctions
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SanctionsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path d="M12 3 20 6v6c0 5-3.4 8.8-8 10.5C7.4 20.8 4 17 4 12V6z" fill={fill} />
        <path d="M12 3 20 6v6c0 .3 0 .7-.1 1L12 3z" fill={lift} />
        <rect x="11" y="8" width="2" height="6" rx="1" fill={cut} />
        <circle cx="12" cy="16.5" r="1.3" fill={cut} />
      </>
    )}
  />
)

/**
 * Settings
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SettingsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, cut }) => (
      <>
        <path
          d="M12 2.5c.7 0 1.3.5 1.5 1.2l.3 1.3c.6.2 1.1.5 1.6.9l1.2-.5a1.6 1.6 0 0 1 2 .7l.9 1.5c.4.6.2 1.5-.4 2l-1 .8c.1.6.1 1.2 0 1.8l1 .8c.6.5.8 1.4.4 2l-.9 1.5a1.6 1.6 0 0 1-2 .7l-1.2-.5c-.5.4-1 .7-1.6.9l-.3 1.3c-.2.7-.8 1.2-1.5 1.2s-1.3-.5-1.5-1.2l-.3-1.3c-.6-.2-1.1-.5-1.6-.9l-1.2.5a1.6 1.6 0 0 1-2-.7l-.9-1.5c-.4-.6-.2-1.5.4-2l1-.8a6.6 6.6 0 0 1 0-1.8l-1-.8c-.6-.5-.8-1.4-.4-2l.9-1.5a1.6 1.6 0 0 1 2-.7l1.2.5c.5-.4 1-.7 1.6-.9l.3-1.3c.2-.7.8-1.2 1.5-1.2z"
          fill={fill}
        />
        <circle cx="12" cy="12" r="3.1" fill={cut} />
      </>
    )}
  />
)

/**
 * Console
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ConsoleGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2.5" fill={fill} />
        <rect x="3" y="4" width="18" height="4" rx="2.5" fill={lift} />
        <path
          d="M6.5 11.5 9 13.5 6.5 15.5"
          fill="none"
          stroke={cut}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11 15.5h4" stroke={cut} strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Search
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SearchGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <rect x="14" y="14" width="8" height="4" rx="2" transform="rotate(45 14 14)" fill={deep} />
        <circle cx="10" cy="10" r="7.5" fill={fill} />
        <circle cx="10" cy="10" r="4" fill={cut} />
      </>
    )}
  />
)

/**
 * Notifications
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const BellGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <circle cx="12" cy="3.5" r="1.6" fill={lift} />
        <path d="M4.5 17c1.5-1 2-3 2-6a5.5 5.5 0 0 1 11 0c0 3 .5 5 2 6z" fill={fill} />
        <path d="M9.2 18a2.9 2.9 0 0 0 5.6 0z" fill={deep} />
      </>
    )}
  />
)

/**
 * Lock
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LockGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <path
          d="M8 10V8a4 4 0 0 1 8 0v2"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="4" y="10" width="16" height="12" rx="3.5" fill={fill} />
        <circle cx="12" cy="15" r="2" fill={cut} />
        <rect x="11" y="15.5" width="2" height="4" rx="1" fill={cut} />
      </>
    )}
  />
)

/**
 * Unlock
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const UnlockGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <path
          d="M8 10V8a4 4 0 0 1 7.4-2"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="4" y="10" width="16" height="12" rx="3.5" fill={fill} />
        <circle cx="12" cy="15" r="2" fill={cut} />
        <rect x="11" y="15.5" width="2" height="4" rx="1" fill={cut} />
      </>
    )}
  />
)

/**
 * Key
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const KeyGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <circle cx="8" cy="8" r="5" fill={fill} />
        <circle cx="8" cy="8" r="2" fill={cut} />
        <path
          d="m11.6 11.6 8 8M17 17l2-2M15 15l1.6-1.6"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Mail
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const MailGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" fill={fill} />
        <path d="M3 6.5 12 13l9-6.5V8l-9 6.5L3 8z" fill={lift} />
        <path
          d="m4 7 8 5.5L20 7"
          fill="none"
          stroke={cut}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Clock
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ClockGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, cut }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={fill} />
        <path
          d="M12 7v5.3l3.6 2"
          fill="none"
          stroke={cut}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Deadline
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DeadlineGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M6 3h12v3l-5 6 5 6v3H6v-3l5-6-5-6z" fill={fill} />
        <path d="M6 3h12v3l-5 6-5-6z" fill={lift} />
        <path d="M9 19.5h6L12 16z" fill={deep} />
      </>
    )}
  />
)

/**
 * Phone
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const PhoneGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="M6.6 3c1 0 1.9.6 2.2 1.6l1 3c.3.9 0 1.9-.8 2.4l-1.5.9a12 12 0 0 0 5.6 5.6l.9-1.5c.5-.8 1.5-1.1 2.4-.8l3 1c1 .3 1.6 1.2 1.6 2.2v2.6c0 1.3-1.1 2.4-2.5 2.3C11 24 3 15.9 2.7 6.5 2.6 5.1 3.7 4 5 4z"
          fill={fill}
        />
        <path d="M6.6 3c1 0 1.9.6 2.2 1.6l1 3-3.9 1.2L5 4C4.8 3.4 5.4 3 6 3z" fill={lift} />
      </>
    )}
  />
)

/**
 * Spark
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SparkGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="M13 2c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z"
          fill={fill}
        />
        <path
          d="M5.5 13c.3 2.2 1.3 3.2 3.5 3.5-2.2.3-3.2 1.3-3.5 3.5-.3-2.2-1.3-3.2-3.5-3.5 2.2-.3 3.2-1.3 3.5-3.5z"
          fill={lift}
        />
      </>
    )}
  />
)

/**
 * Star
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const StarGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <path
          d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.8z"
          fill={fill}
        />
        <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.2 5.8z" fill={lift} />
      </>
    )}
  />
)

/**
 * Golden star
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const NewsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="GOLD"
    render={({ fill, lift, deep }) => (
      <>
        <path
          d="m12 2.6 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z"
          fill={fill}
          stroke={deep}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="m12 2.6 2.7 5.6 6.1.8-4.5 4.2-4.3-2.2z" fill={lift} />
      </>
    )}
  />
)

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
 * Edit
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const EditGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M14.5 4.5 19.5 9.5 9 20l-5.5.5L4 15z" fill={fill} />
        <path d="M14.5 4.5 19.5 9.5l-2 2-5-5z" fill={lift} />
        <path d="M4 15 9 20l-5.5.5z" fill={deep} />
      </>
    )}
  />
)

/**
 * Remove
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const RemoveGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <path d="M5 7h14l-1 12.6a2.5 2.5 0 0 1-2.5 2.3h-7A2.5 2.5 0 0 1 6 19.6z" fill={fill} />
        <path d="M3.5 7h17" stroke={deep} strokeWidth="2.4" strokeLinecap="round" />
        <path
          d="M9 5.5a2 2 0 0 1 6 0"
          fill="none"
          stroke={deep}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M10 11v6M14 11v6" stroke={cut} strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Copy
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const CopyGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift }) => (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2.6" fill={fill} />
        <rect x="4" y="3" width="12" height="13" rx="2.6" fill={lift} />
      </>
    )}
  />
)

/**
 * Sign out
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SignOutGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <rect x="3" y="3" width="10" height="18" rx="3.5" fill={fill} />
        <path
          d="M10 12h9m0 0-3.5-3.5M19 12l-3.5 3.5"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="12" r="1.3" fill={cut} />
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
 * Analytics
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const AnalyticsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path
          d="M4 4v14.5a1.5 1.5 0 0 0 1.5 1.5H20"
          fill="none"
          stroke={fill}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="m7 15 4-5 3 2 5-7"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="5" r="2" fill={lift} />
      </>
    )}
  />
)

/**
 * Metrics
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const MetricsGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <rect x="3" y="13" width="4.5" height="8" rx="1.6" fill={deep} />
        <rect x="9.75" y="8" width="4.5" height="13" rx="1.6" fill={fill} />
        <rect x="16.5" y="4" width="4.5" height="17" rx="1.6" fill={lift} />
      </>
    )}
  />
)

/**
 * Queue
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const QueueGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M12 3 21 8l-9 5-9-5z" fill={lift} />
        <path
          d="m3 12 9 5 9-5"
          fill="none"
          stroke={fill}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="m3 16 9 5 9-5"
          fill="none"
          stroke={deep}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Database
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DatabaseGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <ellipse cx="12" cy="6" rx="8" ry="3" fill={lift} />
        <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" fill={fill} />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" fill="none" stroke={deep} strokeWidth="1.4" />
      </>
    )}
  />
)

/**
 * Storage
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const StorageGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" fill={fill} />
        <rect x="3" y="14" width="18" height="5" rx="2" fill={lift} />
        <circle cx="7.5" cy="16.5" r="1.3" fill={cut} />
      </>
    )}
  />
)

/**
 * Scan
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ScanGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, cut }) => (
      <>
        <path
          d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2"
          fill="none"
          stroke={fill}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <rect x="4" y="11" width="16" height="2.4" rx="1.2" fill={cut} />
      </>
    )}
  />
)

/**
 * Journal
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const JournalGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2.5" fill={fill} />
        <rect x="4" y="3" width="16" height="5" rx="2.5" fill={lift} />
        <path
          d="M7.5 12h9M7.5 15.5h9M7.5 19h5"
          stroke={cut}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Sheet
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SheetGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M6 3h8l5 5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 21V4.5A1.5 1.5 0 0 1 6 3z"
          fill={fill}
        />
        <path d="M14 3v4a1 1 0 0 0 1 1h4z" fill={lift} />
        <path
          d="M8.5 13h7M8.5 16.5h7M8.5 20h4"
          stroke={cut}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * History
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const HistoryGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <circle cx="12" cy="13" r="8" fill={fill} />
        <path
          d="M12 9v4.3l3 1.7"
          fill="none"
          stroke={cut}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 6.5 3.8 3 7.2 4"
          fill="none"
          stroke={deep}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Refresh
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const RefreshGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep }) => (
      <>
        <path
          d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5M4.5 12a7.5 7.5 0 0 0 12.6 5.5"
          fill="none"
          stroke={fill}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M17.5 3.5v3.5H14M6.5 20.5V17H10"
          fill="none"
          stroke={deep}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Visible
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const VisibleGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, cut }) => (
      <>
        <path d="M2 12c2-4.5 5.8-7 10-7s8 2.5 10 7c-2 4.5-5.8 7-10 7s-8-2.5-10-7z" fill={fill} />
        <circle cx="12" cy="12" r="3.4" fill={cut} />
      </>
    )}
  />
)

/**
 * Hidden
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const HiddenGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep, cut }) => (
      <>
        <path
          d="M2 12c2-4.5 5.8-7 10-7s8 2.5 10 7c-2 4.5-5.8 7-10 7s-8-2.5-10-7z"
          fill={fill}
          opacity="0.55"
        />
        <circle cx="12" cy="12" r="3.4" fill={cut} opacity="0.55" />
        <path d="M3.5 3.5 20.5 20.5" stroke={deep} strokeWidth="2.2" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Emoji
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const EmojiGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, deep }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={fill} />
        <circle cx="8.7" cy="10" r="1.3" fill={deep} />
        <circle cx="15.3" cy="10" r="1.3" fill={deep} />
        <path
          d="M7.5 14c1 1.7 2.6 2.6 4.5 2.6s3.5-.9 4.5-2.6"
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
 * Birthday
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const BirthdayGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <rect x="3.5" y="13" width="17" height="8" rx="2" fill={fill} />
        <rect x="3.5" y="9.5" width="17" height="4" fill={lift} />
        <path
          d="M8 4.5v3M12 3v4.5M16 4.5v3"
          stroke={deep}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="8" cy="3.5" r="1" fill={cut} />
        <circle cx="12" cy="2" r="1" fill={cut} />
        <circle cx="16" cy="3.5" r="1" fill={cut} />
      </>
    )}
  />
)

/**
 * Skill
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const SkillGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={fill} />
        <circle cx="12" cy="12" r="5.6" fill={cut} />
        <circle cx="12" cy="12" r="2.2" fill={lift} />
      </>
    )}
  />
)

/**
 * Objective
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ObjectiveGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M6 2.5v19" stroke={deep} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M6 4h12l-3 4 3 4H6z" fill={fill} />
        <path d="M6 4h12l-3 4H6z" fill={lift} />
      </>
    )}
  />
)

/**
 * Dispositif
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DispositifGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M11 8v14h2V8z" fill={deep} />
        <path d="M11 4h7l-2.5 3L18 10h-7z" fill={fill} />
        <path d="M13 5.5h6.5l-2.2 2.5 2.2 2.5H13z" fill={lift} />
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

/**
 * Platform
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const PlatformGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep, cut }) => (
      <>
        <rect x="3" y="3" width="8.5" height="8.5" rx="2" fill={fill} />
        <rect x="12.5" y="3" width="8.5" height="8.5" rx="2" fill={lift} />
        <rect x="3" y="12.5" width="8.5" height="8.5" rx="2" fill={lift} />
        <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="2" fill={deep} />
        <circle cx="7.25" cy="7.25" r="1.3" fill={cut} />
      </>
    )}
  />
)

/**
 * Note
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const NoteGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path d="M4 3.5h13L20 7v13.5H4z" fill={fill} />
        <path d="M17 3.5v3a1 1 0 0 0 1 1h2" fill={lift} />
        <path
          d="M7.5 11h9M7.5 14.5h9M7.5 18h5"
          stroke={cut}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </>
    )}
  />
)

/**
 * Discord
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v9A2.5 2.5 0 0 1 18.5 17H10l-5 4v-4H5.5A2.5 2.5 0 0 1 3 14.5z"
          fill={fill}
        />
        <circle cx="9" cy="10.3" r="1.4" fill={cut} />
        <circle cx="15" cy="10.3" r="1.4" fill={cut} />
        <path d="M7.5 6.5h9" stroke={lift} strokeWidth="1.4" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Glossary
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const GlossaryGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M12 5C9.5 3.5 5.5 3.5 3 5v13c2.5-1.5 6.5-1.5 9 0z" fill={fill} />
        <path d="M12 5c2.5-1.5 6.5-1.5 9 0v13c-2.5-1.5-6.5-1.5-9 0z" fill={lift} />
        <rect x="11" y="5" width="2" height="13" rx="1" fill={deep} />
      </>
    )}
  />
)

/**
 * Blocked
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const BlockedGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, cut }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={fill} />
        <path d="M6.5 6.5 17.5 17.5" stroke={cut} strokeWidth="2.2" strokeLinecap="round" />
      </>
    )}
  />
)

/**
 * Help
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const HelpGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, cut }) => (
      <>
        <circle cx="12" cy="12" r="9" fill={fill} />
        <path
          d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.2-2.7 4"
          fill="none"
          stroke={cut}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17" r="1.3" fill={cut} />
      </>
    )}
  />
)

/**
 * Shield
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const ShieldGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path d="M12 3 20 6v6c0 5-3.4 8.8-8 10.5C7.4 20.8 4 17 4 12V6z" fill={fill} />
        <path d="M12 3 20 6v6c0 .3 0 .7-.1 1L12 3z" fill={lift} />
        <path
          d="m8.5 12 2.6 2.6L15.6 9"
          fill="none"
          stroke={cut}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Second factor
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const TwoFactorGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    render={({ fill, lift, cut }) => (
      <>
        <path d="M12 2.5 20 5.5v6.2c0 5-3.4 8.9-8 10.8-4.6-1.9-8-5.8-8-10.8V5.5z" fill={fill} />
        <path d="M12 2.5 20 5.5v6.2c0 .4 0 .8-.1 1.2L12 2.5z" fill={lift} />
        <path
          d="M9.6 11.2V9.8a2.4 2.4 0 0 1 4.8 0v1.4"
          fill="none"
          stroke={cut}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <rect x="8.4" y="11" width="7.2" height="5.6" rx="1.4" fill={cut} />
      </>
    )}
  />
)

// Role glyphs take the tint of the function they carry
interface TintedGlyphProps extends GlyphProps {
  tone?: FrameTone
}

/**
 * Moderator
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const ModeratorGlyph = ({ className, tone = 'brand' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M12 2.4 20.2 5.6v6.3c0 5.1-3.5 8.9-8.2 10.7-4.7-1.8-8.2-5.6-8.2-10.7V5.6z"
          fill={fill}
        />
        <path d="M12 2.4 20.2 5.6v6.3c0 .4 0 .8-.1 1.2L12 2.4z" fill={lift} />
        <path
          d="M20.1 13.1c-.6 4.5-3.8 7.8-8.1 9.5v-2.2c3.4-1.6 5.9-4.3 6.6-7.8z"
          fill={deep}
          opacity="0.6"
        />
        <path
          d="m8.4 12.2 2.6 2.6 4.6-5.4"
          fill="none"
          stroke={cut}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  />
)

/**
 * Junior
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const JuniorGlyph = ({ className, tone = 'brand' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path
          d="M12 2.4 20.2 5.6v6.3c0 5.1-3.5 8.9-8.2 10.7-4.7-1.8-8.2-5.6-8.2-10.7V5.6z"
          fill={fill}
        />
        <path d="M12 2.4 20.2 5.6v6.3c0 .4 0 .8-.1 1.2L12 2.4z" fill={lift} />
        <path
          d="M20.1 13.1c-.6 4.5-3.8 7.8-8.1 9.5v-2.2c3.4-1.6 5.9-4.3 6.6-7.8z"
          fill={deep}
          opacity="0.6"
        />
        <path d="M12 17.6v-5.4" fill="none" stroke={cut} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 12.4c-.4-2.3-2-3.6-4.2-3.6.1 2.3 1.8 3.8 4.2 3.6z" fill={cut} />
        <path d="M12 13.6c.3-2.6 2.1-4.1 4.6-4.1-.1 2.6-2 4.3-4.6 4.1z" fill={cut} />
      </>
    )}
  />
)

/**
 * Discord moderator function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const DiscordFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="DISCORD"
    render={({ fill, lift, cut }) => (
      <>
        <path
          d="M9 3.2h9.5A2.5 2.5 0 0 1 21 5.7v5.5a2.5 2.5 0 0 1-2.5 2.5H18v2.6l-3-2.6H9a2.5 2.5 0 0 1-2.5-2.5V5.7A2.5 2.5 0 0 1 9 3.2z"
          fill={lift}
        />
        <path
          d="M5.5 8.4H15a2.5 2.5 0 0 1 2.5 2.5v5.5a2.5 2.5 0 0 1-2.5 2.5H9.5l-3.6 2.8v-2.8h-.4A2.5 2.5 0 0 1 3 16.4v-5.5a2.5 2.5 0 0 1 2.5-2.5z"
          fill={fill}
        />
        <circle cx="7.2" cy="13.7" r="1" fill={cut} />
        <circle cx="10.25" cy="13.7" r="1" fill={cut} />
        <circle cx="13.3" cy="13.7" r="1" fill={cut} />
      </>
    )}
  />
)

/**
 * Live moderator function
 * @param {GlyphProps} props - Sizing class
 * @return {JSX.Element}
 */

export const LiveFunctionGlyph = ({ className }: GlyphProps) => (
  <Frame
    className={className}
    tone="LIVE"
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M12 17.4V21M8.6 21h6.8" stroke={deep} strokeWidth="2" strokeLinecap="round" />
        <rect x="2.5" y="4" width="19" height="13.4" rx="3" fill={fill} />
        <path d="M5.5 4h13a3 3 0 0 1 3 3v.8h-19V7a3 3 0 0 1 3-3z" fill={lift} opacity="0.55" />
        <path
          d="M10.2 8.6v5.4l4.5-2.7z"
          fill={cut}
          stroke={cut}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="18.3" cy="6.9" r="1.1" fill={deep} />
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

/**
 * Responsable
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const ResponsableGlyph = ({ className, tone = 'RESPONSABLE' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
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
        <path
          d="M12 8.2c.5 2 2.6 3.4 3.6 5.4.5 1 .8 1.9.8 3 0 2.7-2 4.7-4.4 4.7s-4.4-2-4.4-4.5c0-1.5.7-2.7 1.7-3.6.2.9.7 1.5 1.3 1.8-.2-2.3.3-4.8 1.4-6.8z"
          fill={lift}
        />
        <path
          d="M12 13.2c.4 1.4 1.8 2.4 2.2 3.9.2.6.2 1.2.1 1.7-.3 1.2-1.2 2-2.3 2-1.3 0-2.3-1-2.3-2.3 0-1.1.6-1.9 1.3-2.5.1.6.4 1 .7 1.2-.2-1.4-.2-2.8.3-4z"
          fill={cut}
        />
      </>
    )}
  />
)

/**
 * Administrator
 * @param {TintedGlyphProps} props - Sizing class and tint
 * @return {JSX.Element}
 */

export const AdminGlyph = ({ className, tone = 'ADMIN' }: TintedGlyphProps) => (
  <Frame
    className={className}
    tone={tone}
    render={({ fill, lift, deep, cut }) => (
      <>
        <path d="M3.4 8.6 7.8 12.2 12 5.2l4.2 7 4.4-3.6-1.7 9.6H5.1z" fill={fill} />
        <path
          d="M12 5.2 7.8 12.2 3.4 8.6l1.2 6.8c2.4-1.6 4.9-5.5 7.4-10.2z"
          fill={lift}
          opacity="0.55"
        />
        <path d="M5 17.6h14v2.1a1.1 1.1 0 0 1-1.1 1.1H6.1A1.1 1.1 0 0 1 5 19.7z" fill={deep} />
        <circle cx="3.4" cy="8.2" r="1.4" fill={lift} />
        <circle cx="12" cy="4.6" r="1.6" fill={lift} />
        <circle cx="20.6" cy="8.2" r="1.4" fill={lift} />
        <path d="m12 12.4 1.5 1.8-1.5 1.8-1.5-1.8z" fill={cut} />
        <circle cx="8.4" cy="19.2" r="0.7" fill={cut} />
        <circle cx="15.6" cy="19.2" r="0.7" fill={cut} />
      </>
    )}
  />
)

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
