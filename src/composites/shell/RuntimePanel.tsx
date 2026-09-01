import { Badge } from '@/components/elements/display/Badge'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { VIEW_COPY } from '@/declarations/access/copy'
import { PROBE_STATUS_REGISTRY, SUBJECT_REGISTRY } from '@/declarations/system/subjects'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { RuntimeReport } from '@/core/services/system/ConsoleService'

export interface RuntimePanelProps {
  report: RuntimeReport
}

/**
 * Infrastructure rows
 * @param {RuntimeReport} report - Runtime state resolved server-side
 * @return {JSX.Element}
 */

export const RuntimePanel = ({ report }: RuntimePanelProps) => {
  const live = report.subjects.filter((entry) => entry.enabled)

  if (live.length === 0) {
    return (
      <EmptyState
        figure="settings"
        title={VIEW_COPY.runtimeDown}
        description={VIEW_COPY.runtimeDownLead}
        action={<Badge label={report.label} tone="neutral" icon="console" />}
      />
    )
  }

  return (
    <div className={CONSOLE_BLOCK.rows}>
      {report.subjects.map((entry) => {
        const meta = SUBJECT_REGISTRY.get(entry.subject)
        const Icon = ICONS[meta.icon]
        const probe = entry.probe ? PROBE_STATUS_REGISTRY.get(entry.probe.status) : null

        return (
          <div key={entry.subject} className={CONSOLE_BLOCK.row}>
            <span className={CONSOLE_BLOCK.rowLabel}>
              <Icon className={CONSOLE_BLOCK.rowIcon} aria-hidden="true" />
              {meta.label}
            </span>
            <span className={CONSOLE_BLOCK.rowStatus}>
              {entry.probe && probe && (
                <span className={CONSOLE_BLOCK.rowMeta}>{`${entry.probe.latencyMs} ms`}</span>
              )}
              {probe ? (
                <Badge label={probe.label} tone={probe.tone} dot />
              ) : (
                <Badge
                  label={entry.enabled ? VIEW_COPY.probeMissing : VIEW_COPY.subjectOff}
                  tone="neutral"
                  dot
                />
              )}
              <Badge
                label={entry.enabled ? VIEW_COPY.subjectOn : VIEW_COPY.subjectOff}
                tone={entry.enabled ? 'success' : 'neutral'}
              />
            </span>
          </div>
        )
      })}
    </div>
  )
}
