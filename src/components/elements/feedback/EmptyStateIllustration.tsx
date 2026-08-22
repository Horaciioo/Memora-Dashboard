import type { FC } from 'react'

export interface EmptyStateIllustrationProps {
  className?: string
}

// Shared drawing attributes, keeps every figure visually related
const STROKE = {
  fill: 'none',
  stroke: 'var(--color-brand-600)',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const FAINT = {
  fill: 'none',
  stroke: 'var(--color-border-strong)',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/**
 * Wrapper giving every figure the same canvas
 * @param {Object} props - Figure content
 * @param {string} [props.className] - Extra classes merged onto the svg
 * @param {React.ReactNode} props.children - Drawn paths
 * @return {JSX.Element}
 */

const Figure = ({ className, children }: EmptyStateIllustrationProps & { children: React.ReactNode }) => (
  <svg viewBox="0 0 96 96" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
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
    <path d="M20 34h56l-6 42H26Z" {...STROKE} />
    <path d="M14 22h68l-6 12H20Z" {...STROKE} />
    <path d="M40 46h16" {...FAINT} strokeDasharray="2 6" />
    <path d="M38 58h20" {...FAINT} strokeDasharray="2 6" />
    <circle cx="48" cy="22" r="0" {...FAINT} />
  </Figure>
)

/**
 * Magnifying glass over an empty line — default figure for the "filter" variant
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const NoResultsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <circle cx="42" cy="42" r="24" {...STROKE} />
    <path d="M60 60 78 78" {...STROKE} />
    <path d="M32 38h20M32 48h12" {...FAINT} strokeDasharray="2 6" />
  </Figure>
)

/**
 * Two silhouettes side by side — figure for member collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const MembersIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <circle cx="38" cy="34" r="13" {...STROKE} />
    <path d="M16 74c0-12 10-20 22-20s22 8 22 20" {...STROKE} />
    <circle cx="68" cy="40" r="9" {...FAINT} />
    <path d="M56 72c0-9 6-15 12-15s12 6 12 15" {...FAINT} />
  </Figure>
)

/**
 * Board with three columns — figure for project collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const ProjectsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="12" y="20" width="72" height="56" rx="6" {...STROKE} />
    <path d="M36 20v56M60 20v56" {...STROKE} />
    <rect x="17" y="30" width="14" height="10" rx="2" {...FAINT} />
    <rect x="41" y="30" width="14" height="10" rx="2" {...FAINT} />
    <rect x="41" y="46" width="14" height="10" rx="2" {...FAINT} />
  </Figure>
)

/**
 * Checklist with one ticked line — figure for task collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const TasksIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="20" y="14" width="56" height="68" rx="7" {...STROKE} />
    <path d="M30 34l6 6 10-12" {...STROKE} />
    <path d="M54 36h14" {...FAINT} />
    <rect x="30" y="52" width="12" height="12" rx="3" {...FAINT} />
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
    <rect x="14" y="22" width="68" height="58" rx="7" {...STROKE} />
    <path d="M14 40h68" {...STROKE} />
    <path d="M32 14v14M64 14v14" {...STROKE} />
    <circle cx="34" cy="55" r="4" {...FAINT} />
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
    <rect x="14" y="22" width="68" height="58" rx="7" {...STROKE} />
    <path d="M14 40h68M32 14v14M64 14v14" {...STROKE} />
    <path d="M38 52 58 70M58 52 38 70" {...STROKE} />
  </Figure>
)

/**
 * Broadcast tower with three rings — figure for the livecon
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const LiveconIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <circle cx="48" cy="44" r="7" {...STROKE} />
    <path d="M34 30a20 20 0 0 0 0 28M62 30a20 20 0 0 1 0 28" {...STROKE} />
    <path d="M24 20a34 34 0 0 0 0 48M72 20a34 34 0 0 1 0 48" {...FAINT} />
    <path d="M44 52 40 80h16l-4-28" {...STROKE} />
  </Figure>
)

/**
 * Graduation cap over a book — figure for the academy
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const AcademyIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M48 20 84 34 48 48 12 34Z" {...STROKE} />
    <path d="M24 40v14c0 6 11 10 24 10s24-4 24-10V40" {...STROKE} />
    <path d="M80 36v18" {...FAINT} />
    <circle cx="80" cy="58" r="4" {...FAINT} />
  </Figure>
)

/**
 * Sticky note with a folded corner — figure for note collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const NotesIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M20 16h44l16 16v48a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4Z" {...STROKE} />
    <path d="M64 16v16h16" {...STROKE} />
    <path d="M28 48h32M28 60h24" {...FAINT} strokeDasharray="2 6" />
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
    <circle cx="38" cy="30" r="7" {...STROKE} />
    <circle cx="62" cy="48" r="7" {...STROKE} />
    <circle cx="34" cy="66" r="7" {...STROKE} />
  </Figure>
)

/**
 * Shield with a gavel — figure for moderation surfaces
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const ModerationIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <path d="M48 12 78 24v22c0 18-13 30-30 38-17-8-30-20-30-38V24Z" {...STROKE} />
    <path d="M38 46l8 8M54 38l-8 8" {...FAINT} />
    <rect x="50" y="30" width="16" height="10" rx="3" transform="rotate(45 58 35)" {...STROKE} />
  </Figure>
)

/**
 * Linked squares — figure for team collections
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const TeamsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Figure className={className}>
    <rect x="36" y="12" width="24" height="18" rx="5" {...STROKE} />
    <rect x="10" y="60" width="24" height="18" rx="5" {...FAINT} />
    <rect x="36" y="60" width="24" height="18" rx="5" {...FAINT} />
    <rect x="62" y="60" width="24" height="18" rx="5" {...FAINT} />
    <path d="M48 30v14M22 60V44h52v16" {...STROKE} />
  </Figure>
)
