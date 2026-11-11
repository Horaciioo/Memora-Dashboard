import { formatValue } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Value cell, empty in grey italic
 * @param {Object} props - Props
 * @param {unknown} props.value - Value
 * @return {JSX.Element}
 */

export const Cell = ({ value }: { value: unknown }) => {
  const { session } = useAuthContext()
  const text = formatValue(value, session?.timezone ?? undefined)

  if (text === null) return <span className={NEXUS_STYLES.empty}>{NEXUS_TERMINAL_COPY.empty}</span>

  return <>{text}</>
}
