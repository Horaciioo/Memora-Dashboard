import { leafPaths } from '@/core/lib/play/laurel'
import { cn } from '@/utils/classnames'

export interface LaurelLeafProps {
  x: number
  y: number
  rotation: number
  length: number
  // Gradient url painting the blade
  fill: string
  // Veins and reflections
  rich: boolean
  // Plain white silhouette for masks
  flat?: boolean
  // Sway delay in seconds, none when still
  delay?: number
}

/**
 * One laurel leaf
 * @param {LaurelLeafProps} props - Placement and paint
 * @return {JSX.Element}
 */

export const LaurelLeaf = ({
  x,
  y,
  rotation,
  length,
  fill,
  rich,
  flat,
  delay,
}: LaurelLeafProps) => {
  const paths = leafPaths(length)

  if (flat)
    return (
      <path
        transform={`translate(${x} ${y}) rotate(${rotation})`}
        d={paths.outline}
        fill="var(--laurel-shine)"
      />
    )

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <g
        className={cn(delay !== undefined && 'laurel-sway')}
        style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}
      >
        <path d={paths.outline} fill={fill} className="laurel-edge" />
        <path d={paths.shadow} className="laurel-shadow" />
        <path d={paths.sheen} className="laurel-sheen" />
        {rich && (
          <>
            <path d={paths.rib} className="laurel-vein" />
            <path d={paths.veins} className="laurel-vein laurel-vein-soft" />
            <path d={paths.reflect} className="laurel-reflect" />
          </>
        )}
      </g>
    </g>
  )
}
