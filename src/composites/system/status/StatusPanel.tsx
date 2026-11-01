import { Status } from '@/components/elements/display/Status'
import { StatusBars } from '@/composites/system/status/StatusBars'
import type { StatusReport } from '@/core/services/system/StatusService'
import { STATUS_COPY } from '@/declarations/system/monitoring/status'
import { STATUS_HISTORY_STYLES } from '@/declarations/ui/variants'
import type { Tone } from '@/declarations/ui/theme'
import { formatDayTime } from '@/utils/format/dates'

export interface StatusPanelProps {
  report: StatusReport
  // Blocks drawn, services by default
  show?: ('services' | 'incidents')[]
}

// Colour of each level
const HEALTH_TONES: Record<'up' | 'degraded' | 'down', Tone> = {
  up: 'success',
  degraded: 'warning',
  down: 'danger',
}

/**
 * Services with their 90 day history
 * @param {StatusReport} report - Status report
 * @param {('services' | 'incidents')[]} [show] - Blocks drawn
 * @return {JSX.Element}
 */

export const StatusPanel = ({ report, show = ['services'] }: StatusPanelProps) => {
  if (!report.reachable) {
    return (
      <div className={STATUS_HISTORY_STYLES.service}>
        <Status label={STATUS_COPY.offlineTitle} tone="danger" icon="warning" />
        <p className={STATUS_HISTORY_STYLES.lead}>{STATUS_COPY.offlineLead}</p>
      </div>
    )
  }

  return (
    <>
      {show.includes('services') && (
        <div className={STATUS_HISTORY_STYLES.list}>
          {report.services.map((service) => (
            <div key={service.id} className={STATUS_HISTORY_STYLES.service}>
              <div className={STATUS_HISTORY_STYLES.head}>
                <div>
                  <p className={STATUS_HISTORY_STYLES.name}>{service.label}</p>
                  <p className={STATUS_HISTORY_STYLES.lead}>{service.lead}</p>
                </div>
                <span className={STATUS_HISTORY_STYLES.meta}>
                  {service.ms !== null && (
                    <span className={STATUS_HISTORY_STYLES.mono}>{`${service.ms} ms`}</span>
                  )}
                  <Status
                    label={
                      service.health ? STATUS_COPY.health[service.health] : STATUS_COPY.pending
                    }
                    tone={service.health ? HEALTH_TONES[service.health] : 'neutral'}
                  />
                </span>
              </div>
              <StatusBars days={service.days} uptime={service.uptime} />
            </div>
          ))}
        </div>
      )}
      {show.includes('incidents') && (
        <div className={STATUS_HISTORY_STYLES.list}>
          {report.incidents.length === 0 ? (
            <p className={STATUS_HISTORY_STYLES.lead}>{STATUS_COPY.noIncident}</p>
          ) : (
            report.incidents.slice(0, 20).map((incident) => (
              <div key={incident.id} className={STATUS_HISTORY_STYLES.incident}>
                <span>
                  {report.services.find((service) => service.id === incident.component)?.label}
                </span>
                <Status
                  label={incident.resolvedAt ? STATUS_COPY.resolved : STATUS_COPY.ongoing}
                  tone={incident.resolvedAt ? 'success' : HEALTH_TONES[incident.worst]}
                />
                <span className={STATUS_HISTORY_STYLES.incidentWhen}>
                  {formatDayTime(incident.startedAt)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
