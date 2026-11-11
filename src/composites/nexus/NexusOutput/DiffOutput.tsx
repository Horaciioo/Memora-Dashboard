import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { asRecord } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

/**
 * Before and after, field by field
 * @param {Object} props - Props
 * @param {unknown} props.value - Object with before and after
 * @return {JSX.Element}
 */

export const DiffOutput = ({ value }: { value: unknown }) => {
  const { before, after } = asRecord(value)
  const left = asRecord(before)
  const right = asRecord(after)
  const fields = [...new Set([...Object.keys(left), ...Object.keys(right)])]

  return (
    <div className={NEXUS_STYLES.diffRow}>
      {fields.map((field) => (
        <div key={field} className="contents">
          <span className={NEXUS_STYLES.recordKey}>{field}</span>
          <span className={NEXUS_STYLES.diffBefore}>
            <Cell value={left[field]} />
          </span>
          <span className={NEXUS_STYLES.diffAfter}>
            <Cell value={right[field]} />
          </span>
        </div>
      ))}
    </div>
  )
}
