import { useId } from 'react'
import type { FC, ReactNode } from 'react'

export interface EmptyStateIllustrationProps {
  className?: string
}

// Gradients handed to a scene: candy pink body, pale lift, deep rose
interface ScenePaints {
  fill: string
  lift: string
  deep: string
}

// Light drawn over a deep fill
const LIGHT = 'var(--color-brand-50)'

// White sheet with a pink outline
const SHEET = {
  fill: 'var(--color-surface-raised)',
  stroke: 'var(--color-brand-200)',
  strokeWidth: 1.5,
} as const

// Soft shadow under a shape
const SHADOW = { fill: 'var(--color-ink)', opacity: 0.07 } as const

// Four-point spark
const SPARK = 'M0-1C.16-.36.36-.16 1 0C.36.16.16.36 0 1C-.16.36-.36.16-1 0C-.36-.16-.16-.36 0-1Z'

// Round stroke of a drawn line
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/**
 * Canvas of every figure: a ground shadow and the candy pink ramp
 * @param {Object} props - Sizing class and the drawing
 * @param {string} [props.className] - Classes merged onto the svg
 * @param {(paints: ScenePaints) => ReactNode} props.render - Drawing
 * @return {JSX.Element}
 */

const Scene = ({
  className,
  render,
}: EmptyStateIllustrationProps & { render: (paints: ScenePaints) => ReactNode }) => {
  const scope = useId()
  const fillId = `${scope}-fill`
  const liftId = `${scope}-lift`
  const deepId = `${scope}-deep`

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={fillId}
          x1="30"
          y1="20"
          x2="170"
          y2="180"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--color-brand-200)" />
          <stop offset="1" stopColor="var(--color-brand-500)" />
        </linearGradient>
        <linearGradient
          id={liftId}
          x1="40"
          y1="20"
          x2="160"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--color-brand-50)" />
          <stop offset="1" stopColor="var(--color-brand-200)" />
        </linearGradient>
        <linearGradient
          id={deepId}
          x1="30"
          y1="60"
          x2="170"
          y2="190"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--color-brand-400)" />
          <stop offset="1" stopColor="var(--color-brand-700)" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="178" rx="52" ry="6.5" {...SHADOW} />

      {render({ fill: `url(#${fillId})`, lift: `url(#${liftId})`, deep: `url(#${deepId})` })}
    </svg>
  )
}

/**
 * Scattered sparks around a figure
 * @param {Object} props - Paint and the spark positions
 * @return {JSX.Element}
 */

const Sparks = ({
  paint,
  items,
}: {
  paint: string
  items: readonly { x: number; y: number; size: number; soft?: boolean }[]
}) => (
  <>
    {items.map(({ x, y, size, soft }) => (
      <path
        key={`${x}-${y}`}
        d={SPARK}
        transform={`translate(${x} ${y}) scale(${size})`}
        fill={paint}
        opacity={soft ? 0.55 : 1}
      />
    ))}
  </>
)

/**
 * White sheet lifted by its shadow
 * @param {Object} props - Box of the sheet
 * @return {JSX.Element}
 */

const Sheet = ({
  x,
  y,
  width,
  height,
  radius = 13,
}: {
  x: number
  y: number
  width: number
  height: number
  radius?: number
}) => (
  <>
    <rect x={x} y={y + 6} width={width} height={height} rx={radius} {...SHADOW} />
    <rect x={x} y={y} width={width} height={height} rx={radius} {...SHEET} />
  </>
)

/**
 * Round badge on a corner of a figure
 * @param {Object} props - Paint
 * @return {JSX.Element}
 */

const Badge = ({
  fill,
  x,
  y,
  children,
}: {
  fill: string
  x: number
  y: number
  children: ReactNode
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r="27" fill="var(--color-surface-raised)" />
    <circle r="22" fill={fill} />
    {children}
  </g>
)

// Stroke drawn in the light colour
const GLYPH = { ...LINE, stroke: LIGHT, strokeWidth: 4.5 } as const

/**
 * Open box
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const EmptyBoxIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M42 84 24 62h152l-18 22Z" fill={lift} />
        <path d="M44 84h112l-6 78a10 10 0 0 1-10 9H60a10 10 0 0 1-10-9Z" fill={fill} />
        <path d="M44 84h112l-1.2 16H45.200Z" fill={deep} opacity="0.35" />
        <rect x="74" y="112" width="52" height="9" rx="4.5" fill={LIGHT} opacity="0.85" />
        <Sparks
          paint={lift}
          items={[
            { x: 36, y: 40, size: 9 },
            { x: 164, y: 34, size: 6, soft: true },
            { x: 100, y: 28, size: 7 },
          ]}
        />
      </>
    )}
  />
)

/**
 * Magnifying glass
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const NoResultsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M128 128 168 168" {...LINE} stroke={deep} strokeWidth="16" />
        <circle cx="92" cy="92" r="54" fill={fill} />
        <circle cx="92" cy="92" r="40" fill="var(--color-surface-raised)" />
        <path d="M70 84h44M70 102h28" {...LINE} stroke="var(--color-brand-200)" strokeWidth="7" />
        <Sparks
          paint={lift}
          items={[
            { x: 160, y: 40, size: 8 },
            { x: 30, y: 164, size: 6, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Two people side by side
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const MembersIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <circle cx="134" cy="76" r="22" fill={lift} />
        <path d="M96 168c0-30 17-50 38-50s38 20 38 50Z" fill={lift} />
        <circle cx="76" cy="70" r="27" fill={fill} />
        <path d="M24 170c0-37 24-62 52-62s52 25 52 62Z" fill={fill} />
        <path d="M24 170c0-6 .8-11.5 2-16h100c1.2 4.5 2 10 2 16Z" fill={deep} opacity="0.3" />
        <Sparks
          paint={lift}
          items={[
            { x: 40, y: 32, size: 8 },
            { x: 172, y: 40, size: 6, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Three people gathered
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const TeamsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <circle cx="44" cy="92" r="17" fill={lift} />
        <path d="M12 168c0-24 14-40 32-40s32 16 32 40Z" fill={lift} />
        <circle cx="156" cy="92" r="17" fill={lift} />
        <path d="M124 168c0-24 14-40 32-40s32 16 32 40Z" fill={lift} />
        <circle cx="100" cy="76" r="26" fill={fill} />
        <path d="M52 170c0-34 21-56 48-56s48 22 48 56Z" fill={fill} />
        <path
          d="M52 170c0-5 .6-10 1.8-14.500h92.400c1.2 4.5 1.8 9.5 1.8 14.500Z"
          fill={deep}
          opacity="0.3"
        />
        <Sparks
          paint={lift}
          items={[
            { x: 100, y: 30, size: 8 },
            { x: 30, y: 52, size: 5, soft: true },
            { x: 170, y: 56, size: 6 },
          ]}
        />
      </>
    )}
  />
)

/**
 * Board with three columns
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const ProjectsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <Sheet x={26} y={42} width={148} height={118} />
        <path d="M26 55a13 13 0 0 1 13-13h122a13 13 0 0 1 13 13v14H26Z" fill={fill} />
        <rect x="40" y="82" width="32" height="20" rx="6" fill={lift} />
        <rect x="40" y="110" width="32" height="20" rx="6" fill={lift} opacity="0.6" />
        <rect x="84" y="82" width="32" height="20" rx="6" fill={fill} />
        <rect x="128" y="82" width="32" height="20" rx="6" fill={deep} />
        <rect x="128" y="110" width="32" height="20" rx="6" fill={lift} opacity="0.6" />
        <Sparks
          paint={lift}
          items={[
            { x: 28, y: 26, size: 8 },
            { x: 174, y: 24, size: 6, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Checklist
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const TasksIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <Sheet x={48} y={26} width={104} height={140} />
        <rect x="82" y="16" width="36" height="20" rx="8" fill={deep} />
        <circle cx="72" cy="76" r="10" fill={fill} />
        <path d="m67.5 76 3.5 3.5 6.5-7.5" {...LINE} stroke={LIGHT} strokeWidth="3" />
        <rect x="92" y="72" width="44" height="8" rx="4" fill="var(--color-brand-200)" />
        <circle cx="72" cy="108" r="10" fill={lift} />
        <rect x="92" y="104" width="36" height="8" rx="4" fill="var(--color-brand-200)" />
        <circle cx="72" cy="140" r="10" fill={lift} opacity="0.6" />
        <rect
          x="92"
          y="136"
          width="40"
          height="8"
          rx="4"
          fill="var(--color-brand-200)"
          opacity="0.6"
        />
        <Sparks
          paint={lift}
          items={[
            { x: 28, y: 52, size: 8 },
            { x: 172, y: 70, size: 6, soft: true },
          ]}
        />
      </>
    )}
  />
)

// Columns and rows of the calendar days
const DAY_COLUMNS = [58, 80, 102, 124] as const
const DAY_ROWS = [84, 106, 128] as const

/**
 * Calendar page with its binder rings and day cells
 * @param {Object} props - Paints and the picked cell
 * @return {JSX.Element}
 */

const CalendarPage = ({
  fill,
  deep,
  lift,
  picked,
}: ScenePaints & { picked: readonly [number, number] }) => (
  <>
    <Sheet x={44} y={34} width={112} height={128} />
    <path d="M44 47a13 13 0 0 1 13-13h86a13 13 0 0 1 13 13v22H44Z" fill={fill} />
    {[70, 130].map((x) => (
      <g key={x}>
        <rect x={x - 4} y="24" width="8" height="24" rx="4" fill={deep} />
        <rect x={x - 4} y="24" width="3" height="24" rx="1.5" fill={lift} opacity="0.7" />
      </g>
    ))}
    {DAY_ROWS.flatMap((y, row) =>
      DAY_COLUMNS.map((x, column) => (
        <rect
          key={`${column}-${row}`}
          x={x}
          y={y}
          width="18"
          height="15"
          rx="4.5"
          fill={column === picked[0] && row === picked[1] ? fill : 'var(--color-brand-100)'}
        />
      ))
    )}
  </>
)

/**
 * Calendar page
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const MeetingsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={(paints) => (
      <>
        <CalendarPage {...paints} picked={[2, 1]} />
        <Badge fill={paints.deep} x={150} y={150}>
          <circle r="11" fill="none" stroke={LIGHT} strokeWidth="3.5" />
          <path d="M0-6V0l5 3.5" {...GLYPH} strokeWidth="3.5" />
        </Badge>
        <Sparks
          paint={paints.lift}
          items={[
            { x: 28, y: 60, size: 8 },
            { x: 176, y: 50, size: 6, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Calendar with a crossed out badge
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const AbsencesIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={(paints) => (
      <>
        <CalendarPage {...paints} picked={[1, 0]} />
        <Badge fill={paints.deep} x={150} y={150}>
          <path d="m-8-8 16 16M8-8-8 8" {...GLYPH} strokeWidth="4" />
        </Badge>
        <Sparks
          paint={paints.lift}
          items={[
            { x: 28, y: 60, size: 8 },
            { x: 176, y: 50, size: 6, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Broadcast tower
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const LiveconIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path
          d="M44 56a62 62 0 0 0 0 72M156 56a62 62 0 0 1 0 72"
          {...LINE}
          stroke={lift}
          strokeWidth="9"
        />
        <path
          d="M68 74a34 34 0 0 0 0 36M132 74a34 34 0 0 1 0 36"
          {...LINE}
          stroke={fill}
          strokeWidth="9"
        />
        <path d="M91 104 78 170h44l-13-66Z" fill={deep} />
        <path d="M91 104 78 170h14l9-66Z" fill={lift} opacity="0.35" />
        <circle cx="100" cy="92" r="16" fill={fill} />
        <Sparks
          paint={lift}
          items={[
            { x: 100, y: 30, size: 8 },
            { x: 26, y: 156, size: 5, soft: true },
            { x: 174, y: 152, size: 6 },
          ]}
        />
      </>
    )}
  />
)

/**
 * Open book
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const AcademyIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M100 66c-14-10-40-12-70-8v94c30-4 56-2 70 8Z" fill={fill} />
        <path d="M100 66c14-10 40-12 70-8v94c-30-4-56-2-70 8Z" fill={deep} />
        <path
          d="M42 76c18-2 36 0 50 6M42 96c18-2 36 0 50 6M42 116c18-2 36 0 50 6"
          {...LINE}
          stroke={LIGHT}
          strokeWidth="5"
          opacity="0.8"
        />
        <path
          d="M158 76c-18-2-36 0-50 6M158 96c-18-2-36 0-50 6"
          {...LINE}
          stroke={LIGHT}
          strokeWidth="5"
          opacity="0.5"
        />
        <path d="m100 24 34 14-34 14-34-14Z" fill={lift} />
        <Sparks
          paint={lift}
          items={[
            { x: 30, y: 32, size: 7, soft: true },
            { x: 172, y: 36, size: 8 },
          ]}
        />
      </>
    )}
  />
)

/**
 * Note card with a folded corner
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const NotesIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <Sheet x={46} y={28} width={108} height={138} />
        <path d="M122 28h20a12 12 0 0 1 12 12v20h-20a12 12 0 0 1-12-12Z" fill={lift} />
        <rect x="64" y="82" width="72" height="9" rx="4.5" fill="var(--color-brand-200)" />
        <rect x="64" y="104" width="56" height="9" rx="4.5" fill="var(--color-brand-200)" />
        <rect x="64" y="126" width="64" height="9" rx="4.5" fill="var(--color-brand-200)" />
        <path d="m132 150 28-28 12 12-28 28-16 4Z" fill={fill} />
        <path d="m160 122 6-6a6 6 0 0 1 8.5 0l3.5 3.500a6 6 0 0 1 0 8.500l-6 6Z" fill={deep} />
        <Sparks
          paint={lift}
          items={[
            { x: 28, y: 58, size: 8 },
            { x: 176, y: 80, size: 5, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Bell
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const NotificationsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <circle cx="100" cy="38" r="9" fill={deep} />
        <path d="M100 46c-30 0-48 22-48 52v26l-14 20h124l-14-20V98c0-30-18-52-48-52Z" fill={fill} />
        <path
          d="M100 46c-30 0-48 22-48 52v26l-14 20h30c-6-24-6-58 6-80 6-10 16-16 26-18Z"
          fill={lift}
          opacity="0.5"
        />
        <path d="M82 152a18 18 0 0 0 36 0Z" fill={deep} />
        <Sparks
          paint={lift}
          items={[
            { x: 30, y: 60, size: 8 },
            { x: 172, y: 56, size: 6, soft: true },
            { x: 168, y: 142, size: 5 },
          ]}
        />
      </>
    )}
  />
)

// Teeth of the gear
const GEAR_ANGLES = [0, 45, 90, 135] as const

/**
 * Gear
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const SettingsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        {GEAR_ANGLES.map((angle) => (
          <rect
            key={angle}
            x="86"
            y="22"
            width="28"
            height="136"
            rx="9"
            fill={deep}
            transform={`rotate(${angle} 100 90)`}
          />
        ))}
        <circle cx="100" cy="90" r="50" fill={fill} />
        <circle cx="100" cy="90" r="22" fill="var(--color-surface-raised)" />
        <Sparks
          paint={lift}
          items={[
            { x: 32, y: 40, size: 8 },
            { x: 172, y: 150, size: 7 },
            { x: 40, y: 160, size: 5, soft: true },
          ]}
        />
      </>
    )}
  />
)

/**
 * Shield with a check
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const ModerationIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M100 22 156 42v50c0 36-22 62-56 78-34-16-56-42-56-78V42Z" fill={fill} />
        <path d="M100 22 156 42v50c0 36-22 62-56 78Z" fill={deep} opacity="0.35" />
        <path d="m74 96 20 20 36-40" {...GLYPH} strokeWidth="11" />
        <Sparks
          paint={lift}
          items={[
            { x: 34, y: 54, size: 8 },
            { x: 172, y: 44, size: 6, soft: true },
            { x: 168, y: 150, size: 5 },
          ]}
        />
      </>
    )}
  />
)
