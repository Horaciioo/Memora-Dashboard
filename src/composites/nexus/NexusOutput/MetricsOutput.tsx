import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { asRecord } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

/**
 * Values with their label
 * @param {Object} props - Props
 * @param {unknown} props.value - Object of values
 * @return {JSX.Element}
 */

export const MetricsOutput = ({ value }: { value: unknown }) => (
  <div className={NEXUS_STYLES.metrics}>
    {Object.entries(asRecord(value)).map(([label, entry]) => (
      <div key={label} className={NEXUS_STYLES.metric}>
        <span className={NEXUS_STYLES.metricLabel}>{label}</span>
        <span className={NEXUS_STYLES.metricValue}>
          <Cell value={entry} />
        </span>
      </div>
    ))}
  </div>
)
