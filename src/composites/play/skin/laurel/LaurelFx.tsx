import { orbitCountOf, polar, sparklePath } from '@/core/lib/play/laurel'
import { LAUREL } from '@/declarations/play/laurel'

export interface LaurelFxProps {
  stage: number
  id: string
}

const { centre, view } = LAUREL

/**
 * Aura behind the wreath
 * @param {LaurelFxProps} props - Stage and frame id
 * @return {JSX.Element | null}
 */

export const LaurelAura = ({ stage, id }: LaurelFxProps) =>
  stage < LAUREL.from.aura ? null : (
    <circle
      cx={centre}
      cy={centre}
      r={view / 2 - 2}
      fill={`url(#${id}-aura)`}
      className="laurel-pulse"
    />
  )

/**
 * Gem, halo, orbit and embers over the wreath
 * @param {LaurelFxProps} props - Stage and frame id
 * @return {JSX.Element}
 */

export const LaurelFx = ({ stage }: LaurelFxProps) => {
  const { from, orbit } = LAUREL
  const count = orbitCountOf(stage)

  return (
    <>
      {stage >= from.halo && (
        <circle
          cx={centre}
          cy={centre}
          r={LAUREL.face + 2.5}
          className="laurel-halo laurel-pulse"
        />
      )}
      {stage >= from.gem && (
        <>
          <path d={LAUREL.gem.path} className="laurel-gem" />
          {stage >= from.glow && (
            <path
              d={sparklePath(centre, LAUREL.gem.y, LAUREL.size.glow)}
              className="laurel-twinkle"
            />
          )}
        </>
      )}
      {count > 0 && (
        <g className="laurel-orbit">
          <circle cx={centre} cy={centre} r={orbit.radius} fill="none" />
          {Array.from({ length: count }, (_, index) => {
            const [x, y] = polar(orbit.radius, orbit.start + (index * 360) / count)

            return <path key={index} d={sparklePath(x, y, orbit.size)} className="laurel-orb" />
          })}
        </g>
      )}
      {stage >= from.ember &&
        LAUREL.embers.map(([x, y, delay]) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={LAUREL.size.ember}
            className="laurel-ember"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      {stage >= from.stars &&
        LAUREL.stars.map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d={sparklePath(x, y, LAUREL.size.star)}
            className="laurel-twinkle"
          />
        ))}
    </>
  )
}
