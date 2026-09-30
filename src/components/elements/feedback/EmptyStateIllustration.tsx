import type { FC } from 'react'

export interface EmptyStateIllustrationProps {
  className?: string
}

// Three tones on every figure: a soft body, a deep outline, a lifted accent. Keeps them related
// to the glyph ramp of the shell
const LINE = {
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

// Outline alone
const STROKE = { ...LINE, fill: 'none', stroke: 'var(--color-brand-600)' } as const

// Soft body with its outline
const BODY = { ...LINE, fill: 'var(--color-brand-100)', stroke: 'var(--color-brand-600)' } as const

// Lifted accent, no outline
const LIFT = { fill: 'var(--color-brand-300)', stroke: 'none' } as const

// Quiet detail lines
const FAINT = { ...LINE, fill: 'none', stroke: 'var(--color-brand-300)' } as const

/**
 * Wrapper giving every figure the same canvas: a soft disc, then the drawing standing on it
 * @param {Object} props - Figure content
 * @param {string} [props.className] - Extra classes merged onto the svg
 * @param {React.ReactNode} props.children - Drawn paths
 * @return {JSX.Element}
 */

const Figure = ({
  className,
  children,
}: EmptyStateIllustrationProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 96 96"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="48" cy="50" r="42" fill="var(--color-brand-50)" />
    {children}
  </svg>
)

/**
 * Open, empty box — default figure for the "start" variant
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const EmptyBoxIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M22 38h52l-5 38H27Z" {...BODY} />
    <path d="M16 26h64l-6 12H22Z" {...BODY} />
    <path d="M40 50h16" {...FAINT} />
    <path d="M38 62h20" {...FAINT} />
    <circle cx="48" cy="17" r="4" {...LIFT} />
  </Figure>
)

/**
 * Magnifying glass over an empty line — default figure for the "filter" variant
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const NoResultsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <circle cx="42" cy="42" r="24" {...BODY} />
    <path d="M60 60 78 78" {...STROKE} strokeWidth={4} />
    <path d="M32 38h20M32 48h12" {...FAINT} />
    <circle cx="74" cy="24" r="4" {...LIFT} />
  </Figure>
)

/**
 * Two silhouettes side by side — figure for member collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const MembersIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <circle cx="66" cy="38" r="10" {...LIFT} />
    <path d="M54 74c0-10 6-17 12-17s12 7 12 17Z" {...LIFT} />
    <circle cx="38" cy="34" r="13" {...BODY} />
    <path d="M16 76c0-12 10-20 22-20s22 8 22 20Z" {...BODY} />
  </Figure>
)

/**
 * Board with three columns — figure for project collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const ProjectsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="12" y="20" width="72" height="56" rx="6" {...BODY} />
    <path d="M36 20v56M60 20v56" {...STROKE} />
    <rect x="17" y="30" width="14" height="10" rx="2" {...LIFT} />
    <rect x="41" y="30" width="14" height="10" rx="2" {...LIFT} />
    <rect x="41" y="46" width="14" height="10" rx="2" {...LIFT} />
    <rect x="65" y="30" width="14" height="10" rx="2" {...FAINT} />
  </Figure>
)

/**
 * Checklist with one ticked line — figure for task collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const TasksIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="20" y="14" width="56" height="68" rx="7" {...BODY} />
    <circle cx="35" cy="36" r="8" {...LIFT} />
    <path d="M31 36l3 3 6-7" {...STROKE} />
    <path d="M52 36h14" {...FAINT} />
    <rect x="29" y="52" width="12" height="12" rx="3" {...FAINT} />
    <path d="M50 58h18" {...FAINT} />
  </Figure>
)

/**
 * Calendar page — figure for meeting collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const MeetingsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="14" y="22" width="68" height="58" rx="7" {...BODY} />
    <path d="M14 40h68" {...STROKE} />
    <path d="M32 14v14M64 14v14" {...STROKE} />
    <circle cx="34" cy="55" r="4" {...LIFT} />
    <circle cx="48" cy="55" r="4" {...FAINT} />
    <circle cx="62" cy="55" r="4" {...FAINT} />
    <circle cx="34" cy="68" r="4" {...FAINT} />
  </Figure>
)

/**
 * Calendar with a crossed out day — figure for absence collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const AbsencesIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="14" y="22" width="68" height="58" rx="7" {...BODY} />
    <path d="M14 40h68M32 14v14M64 14v14" {...STROKE} />
    <circle cx="48" cy="61" r="12" {...LIFT} />
    <path d="M42 55 54 67M54 55 42 67" {...STROKE} />
  </Figure>
)

/**
 * Broadcast tower with three rings — figure for the livecon
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const LiveconIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M24 20a34 34 0 0 0 0 48M72 20a34 34 0 0 1 0 48" {...FAINT} />
    <path d="M34 30a20 20 0 0 0 0 28M62 30a20 20 0 0 1 0 28" {...STROKE} />
    <path d="M44 52 40 80h16l-4-28Z" {...BODY} />
    <circle cx="48" cy="44" r="7" {...LIFT} />
  </Figure>
)

/**
 * Graduation cap over a book — figure for the academy
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const AcademyIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M24 40v14c0 6 11 10 24 10s24-4 24-10V40Z" {...BODY} />
    <path d="M48 20 84 34 48 48 12 34Z" {...BODY} />
    <path d="M80 36v18" {...STROKE} />
    <circle cx="80" cy="58" r="4" {...LIFT} />
  </Figure>
)

/**
 * Sticky note with a folded corner — figure for note collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const NotesIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M20 16h44l16 16v48a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4Z" {...BODY} />
    <path d="M64 16v16h16Z" {...LIFT} />
    <path d="M28 48h32M28 60h24" {...FAINT} />
  </Figure>
)

/**
 * Bell at rest on its ground line — figure for the notification surfaces
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const NotificationsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M28 60c0-24 6-34 20-34s20 10 20 34Z" {...BODY} />
    <rect x="20" y="60" width="56" height="9" rx="4" {...BODY} />
    <circle cx="48" cy="18" r="4" {...LIFT} />
    <path d="M48 22v4" {...STROKE} />
    <path d="M41 69a7 7 0 0 0 14 0Z" {...LIFT} />
    <path d="M16 82h64" {...FAINT} />
  </Figure>
)

/**
 * Sliders panel — figure for configuration collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const SettingsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M20 30h56M20 48h56M20 66h56" {...FAINT} />
    <circle cx="38" cy="30" r="8" {...BODY} />
    <circle cx="62" cy="48" r="8" {...LIFT} />
    <circle cx="34" cy="66" r="8" {...BODY} />
  </Figure>
)

/**
 * Shield with a gavel — figure for moderation surfaces
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const ModerationIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M48 12 78 24v22c0 18-13 30-30 38-17-8-30-20-30-38V24Z" {...BODY} />
    <path d="M38 50l8 8" {...STROKE} />
    <rect x="46" y="32" width="18" height="10" rx="3" transform="rotate(45 55 37)" {...LIFT} />
  </Figure>
)

/**
 * Linked squares — figure for team collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const TeamsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M48 30v14M22 60V44h52v16" {...STROKE} />
    <rect x="36" y="12" width="24" height="18" rx="5" {...BODY} />
    <rect x="10" y="60" width="24" height="18" rx="5" {...LIFT} />
    <rect x="36" y="60" width="24" height="18" rx="5" {...LIFT} />
    <rect x="62" y="60" width="24" height="18" rx="5" {...LIFT} />
  </Figure>
)
