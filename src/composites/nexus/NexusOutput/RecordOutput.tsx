import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { asRecord } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

/**
 * Nested objects spread into dotted keys, one line each
 * @param {Record<string, unknown>} record - Object
 * @param {string} [prefix] - Parent path
 * @return {[string, unknown][]} - Flat pairs
 */

const flatten = (record: Record<string, unknown>, prefix: string = ''): [string, unknown][] =>
  Object.entries(record).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key
    const nested = asRecord(entry)

    return Object.keys(nested).length > 0 && !(entry instanceof Date)
      ? flatten(nested, path)
      : [[path, entry] as [string, unknown]]
  })

/**
 * Key and value pairs
 * @param {Object} props - Props
 * @param {unknown} props.value - Object
 * @return {JSX.Element}
 */

export const RecordOutput = ({ value }: { value: unknown }) => (
  <dl className={NEXUS_STYLES.record}>
    {flatten(asRecord(value)).map(([key, entry]) => (
      <div key={key} className="contents">
        <dt className={NEXUS_STYLES.recordKey}>{key}</dt>
        <dd className={NEXUS_STYLES.recordValue}>
          <Cell value={entry} />
        </dd>
      </div>
    ))}
  </dl>
)
