import { LaurelWreath } from '@/composites/play/skin/laurel/LaurelWreath'
import { LAUREL } from '@/declarations/play/laurel'

export interface LaurelSweepProps {
  stage: number
  id: string
}

/**
 * Light passing over the leaves
 * @param {LaurelSweepProps} props - Stage and frame id
 * @return {JSX.Element}
 */

export const LaurelSweep = ({ stage, id }: LaurelSweepProps) => (
  <>
    <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-10" y="-20" width="140" height="160">
      <LaurelWreath stage={stage} id={id} rich={false} flat />
    </mask>
    <g mask={`url(#${id}-mask)`}>
      <g transform={`rotate(22 ${LAUREL.centre} ${LAUREL.centre})`}>
        <rect
          x="-40"
          y="-20"
          width="30"
          height="160"
          fill={`url(#${id}-band)`}
          className="laurel-sweep"
        />
      </g>
    </g>
  </>
)
