import Image from 'next/image'
import { Status } from '@/components/elements/display/Status'
import type { StatusReport } from '@/core/services/system/StatusService'
import { APP_ASSETS, APP_VERSION_LABEL } from '@/declarations/app'
import { STATUS_COPY } from '@/declarations/system/monitoring/status'
import {
  PUBLIC_STATUS_BANNERS,
  PUBLIC_STATUS_STYLES,
  STATUS_BAR_COLOURS,
  STATUS_HISTORY_STYLES,
} from '@/declarations/ui/variants'
import type { Tone } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'

// Colour of each level
const HEALTH_TONES: Record<'up' | 'degraded' | 'down', Tone> = {
  up: 'success',
  degraded: 'warning',
  down: 'danger',
}

/**
 * Status of Memora for anyone, with nothing private on it
 * @param {StatusReport} report - Status report
 * @param {boolean} isEmbedded - Inside the app shell
 * @return {JSX.Element}
 */

export const PublicStatus = ({
  report,
  isEmbedded,
}: {
  report: StatusReport
  isEmbedded: boolean
}) => {
  const version = `${STATUS_COPY.version} ${APP_VERSION_LABEL}`

  return (
    <main
      className={cn(
        PUBLIC_STATUS_STYLES.page,
        isEmbedded ? PUBLIC_STATUS_STYLES.embedded : PUBLIC_STATUS_STYLES.bare
      )}
    >
      <div className={PUBLIC_STATUS_STYLES.brand}>
        <Image
          src={APP_ASSETS.brain}
          alt=""
          width={80}
          height={80}
          className={PUBLIC_STATUS_STYLES.logo}
          priority
        />
        <h1 className={PUBLIC_STATUS_STYLES.brandName}>{STATUS_COPY.brand}</h1>
        <span className={PUBLIC_STATUS_STYLES.version}>{version}</span>
      </div>

      <div
        className={cn(PUBLIC_STATUS_STYLES.banner, PUBLIC_STATUS_BANNERS[report.overall ?? 'down'])}
      >
        <h2 className={PUBLIC_STATUS_STYLES.bannerTitle}>
          {report.reachable && report.overall
            ? STATUS_COPY.overall[report.overall]
            : STATUS_COPY.unavailable}
        </h2>
      </div>

      {report.reachable && (
        <section className={PUBLIC_STATUS_STYLES.card}>
          <h2 className={PUBLIC_STATUS_STYLES.cardTitle}>{STATUS_COPY.servicesTitle}</h2>
          <div className={STATUS_HISTORY_STYLES.list}>
            {report.services.map((service) => (
              <div key={service.id} className={STATUS_HISTORY_STYLES.service}>
                <div className={STATUS_HISTORY_STYLES.head}>
                  <p className={STATUS_HISTORY_STYLES.name}>{service.label}</p>
                  <Status
                    label={
                      service.health ? STATUS_COPY.health[service.health] : STATUS_COPY.pending
                    }
                    tone={service.health ? HEALTH_TONES[service.health] : 'neutral'}
                  />
                </div>
                <div className={STATUS_HISTORY_STYLES.bars} aria-hidden="true">
                  {service.days.map((day, index) => (
                    <span
                      key={index}
                      className={cn(STATUS_HISTORY_STYLES.bar, STATUS_BAR_COLOURS[day ?? 'none'])}
                    />
                  ))}
                </div>
                <div className={PUBLIC_STATUS_STYLES.axis}>
                  <span>{STATUS_COPY.ago}</span>
                  {service.uptime !== null && (
                    <span>{`${service.uptime.toFixed(2)} % ${STATUS_COPY.uptime}`}</span>
                  )}
                  <span>{STATUS_COPY.today}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {report.reachable && (
        <section className={PUBLIC_STATUS_STYLES.card}>
          <h2 className={PUBLIC_STATUS_STYLES.cardTitle}>{STATUS_COPY.incidents}</h2>
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
        </section>
      )}
    </main>
  )
}
