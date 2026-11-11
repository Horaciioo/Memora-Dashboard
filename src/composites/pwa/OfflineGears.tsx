import { OFFLINE_GEARS } from '@/declarations/pwa/gears'
import { gearPath, type GearSpec } from '@/utils/pwa/gearPath'

/**
 * One broken gear, missing tooth and crack
 * @param {GearSpec} gear - Shape and place
 * @return {JSX.Element}
 */

const Gear = ({ gear }: { gear: GearSpec }) => (
  <g transform={`translate(${gear.x} ${gear.y}) rotate(${gear.tilt})`}>
    <path d={gearPath(gear)} fill={gear.fill} fillRule="evenodd" />
    <path
      d={gear.crack}
      fill="none"
      stroke="var(--color-page, #ffffff)"
      strokeWidth={gear.outer * 0.07}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </g>
)

/**
 * Three broken gears, drawn inline to survive without styles
 * @return {JSX.Element}
 */

export const OfflineGears = () => (
  <svg viewBox="0 0 320 210" role="img" aria-hidden="true" className="h-auto w-full max-w-xs">
    <ellipse cx="160" cy="196" rx="104" ry="8" fill="currentColor" opacity="0.08" />
    {OFFLINE_GEARS.map((gear) => (
      <Gear key={gear.key} gear={gear} />
    ))}
  </svg>
)
