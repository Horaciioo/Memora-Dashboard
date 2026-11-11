import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { asRecord } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

/**
 * Key and value pairs
 * @param {Object} props - Props
 * @param {unknown} props.value - Object
 * @return {JSX.Element}
 */

export const RecordOutput = ({ value }: { value: unknown }) => (
  <dl className={NEXUS_STYLES.record}>
    {Object.entries(asRecord(value)).map(([key, entry]) => (
      <div key={key} className="contents">
        <dt className={NEXUS_STYLES.recordKey}>{key}</dt>
        <dd className={NEXUS_STYLES.recordValue}>
          <Cell value={entry} />
        </dd>
      </div>
    ))}
  </dl>
)
