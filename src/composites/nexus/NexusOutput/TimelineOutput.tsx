import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { asRows } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

/**
 * Dated events
 * @param {Object} props - Props
 * @param {unknown} props.value - Rows with at and label
 * @return {JSX.Element}
 */

export const TimelineOutput = ({ value }: { value: unknown }) => {
  const rows = asRows(value)
  if (rows.length === 0) return <p className={NEXUS_STYLES.empty}>{NEXUS_TERMINAL_COPY.empty}</p>

  return (
    <ol className={NEXUS_STYLES.timeline}>
      {rows.map((row, index) => (
        <li key={index} className={NEXUS_STYLES.timelineRow}>
          <span className={NEXUS_STYLES.meta}>
            <Cell value={row.at ?? row.createdAt} />
          </span>
          <span>
            <Cell value={row.label ?? row.event ?? row.commandId ?? row.valeur} />
          </span>
        </li>
      ))}
    </ol>
  )
}
