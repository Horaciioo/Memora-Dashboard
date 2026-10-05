import { Status } from '@/components/elements/display/Status'
import { VIEW_COPY } from '@/declarations/access/copy'
import { PROBE_STATUS_REGISTRY } from '@/declarations/system/subjects'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import type { SubjectState } from '@/core/services/system/ConsoleService'

export interface SubjectBadgesProps {
  state: SubjectState
}

/**
 * One infrastructure subject: the verdict of its probe with the latency
 * @param {SubjectState} state - Subject state resolved server-side
 * @return {JSX.Element}
 */

export const SubjectBadges = ({ state }: SubjectBadgesProps) => {
  const probe = state.probe ? PROBE_STATUS_REGISTRY.get(state.probe.status) : null

  return (
    <span className={CONSOLE_BLOCK.rowStatus}>
      {state.probe && probe && (
        <span className={CONSOLE_BLOCK.rowMeta}>{`${state.probe.latencyMs} ms`}</span>
      )}
      {probe ? (
        <Status label={probe.label} tone={probe.tone} />
      ) : (
        <Status
          label={state.enabled ? VIEW_COPY.subjectOn : VIEW_COPY.subjectOff}
          tone={state.enabled ? 'success' : 'neutral'}
        />
      )}
    </span>
  )
}
