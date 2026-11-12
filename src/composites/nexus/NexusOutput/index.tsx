import { copyText } from '@/composites/nexus/NexusOutput/format'
import { DiffOutput } from '@/composites/nexus/NexusOutput/DiffOutput'
import { MetricsOutput } from '@/composites/nexus/NexusOutput/MetricsOutput'
import { RecordOutput } from '@/composites/nexus/NexusOutput/RecordOutput'
import { TableOutput } from '@/composites/nexus/NexusOutput/TableOutput'
import { TimelineOutput } from '@/composites/nexus/NexusOutput/TimelineOutput'
import { TreeOutput } from '@/composites/nexus/NexusOutput/TreeOutput'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import type { NexusForm } from '@/types/nexus'

// One drawing per form
const FORMS: Record<NexusForm, (props: { value: unknown }) => React.ReactNode> = {
  table: TableOutput,
  record: RecordOutput,
  tree: TreeOutput,
  diff: DiffOutput,
  timeline: TimelineOutput,
  metrics: MetricsOutput,
  text: ({ value }) => <p className={NEXUS_STYLES.text}>{copyText(value ?? '')}</p>,
}

/**
 * Draw a reply in its form, text when the shape is unknown
 * @param {Object} props - Props
 * @param {NexusForm} props.form - Declared form
 * @param {unknown} props.value - Reply value
 * @return {JSX.Element}
 */

export const NexusOutput = ({ form, value }: { form: NexusForm; value: unknown }) => {
  const Draw = FORMS[form] ?? FORMS.text

  return <Draw value={value} />
}
