import { MY_STATS_COPY } from '@/declarations/recruitment/copy'
import { ILLUSTRATIONS } from '@/declarations/ui/illustrations'
import { MY_STATS } from '@/declarations/ui/variants'

/**
 * Drawn figure shown when a metric has no day yet
 * @return {JSX.Element}
 */

export const MetricEmpty = () => {
  const Figure = ILLUSTRATIONS.stats

  return (
    <div className={MY_STATS.empty}>
      <Figure className="h-24 w-24" />
      <p>{MY_STATS_COPY.empty}</p>
    </div>
  )
}
