import type { Metadata } from 'next'
import { Status } from '@/components/elements/display/Status'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { ConsoleBanner } from '@/composites/system/ConsoleBanner'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { JobsSummary } from '@/composites/system/JobsSummary'
import { RuntimePanel } from '@/composites/system/RuntimePanel'
import { StatusPanel } from '@/composites/system/status/StatusPanel'
import { readActivityStats } from '@/core/services/system/ActivityQueryService'
import { readAudience } from '@/core/services/system/AudienceService'
import { readDataReport, readRuntimeReport } from '@/core/services/system/ConsoleService'
import { readQueueReport } from '@/core/services/system/QueueReportService'
import { readStatusReport } from '@/core/services/system/StatusService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { VIEW_COPY } from '@/declarations/access/copy'
import { APP_VERSION } from '@/declarations/app'
import { NavigationViews } from '@/declarations/navigation'
import { CONSOLE_COPY } from '@/declarations/system/monitoring/console'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { formatDayTime } from '@/utils/format/dates'

export const metadata: Metadata = { title: VIEW_COPY.adminTitle }

/**
 * Admin console
 * @return {Promise<JSX.Element>} - Console page
 */

export default async function AdministrationPage() {
  const { scope } = await requirePermission(Permissions.AccessManage)

  const [data, status, pulse, audience, queues] = await Promise.all([
    readDataReport(await scope()),
    readStatusReport(),
    readActivityStats(),
    readAudience(),
    readQueueReport(),
  ])
  const runtime = readRuntimeReport()

  const { counts } = data

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={VIEW_COPY.adminTitle} />

      <ConsoleBanner
        view={NavigationViews.Administration}
        title={`${VIEW_COPY.environment} : ${runtime.label}, ${CONSOLE_COPY.version} ${APP_VERSION}`}
        lead={runtime.started ? undefined : VIEW_COPY.runtimeDownLead}
        aside={
          <Status
            label={runtime.encrypted ? VIEW_COPY.subjectOn : VIEW_COPY.subjectOff}
            tone={runtime.encrypted ? 'success' : 'neutral'}
            icon={runtime.encrypted ? 'lock' : 'unlock'}
          />
        }
      />

      <Section title={CONSOLE_COPY.status} padded>
        <StatusPanel report={status} />
      </Section>

      <Section title={CONSOLE_COPY.pulse} bare>
        <ConsoleMetrics
          metrics={[
            { label: CONSOLE_COPY.activeNow, value: audience.activeDay },
            { label: CONSOLE_COPY.sessions, value: audience.sessions },
            {
              label: CONSOLE_COPY.errors,
              value: pulse.errors,
              hint: `${CONSOLE_COPY.warnings} : ${pulse.warnings}`,
            },
            {
              label: CONSOLE_COPY.lastError,
              value: pulse.lastError ? formatDayTime(pulse.lastError) : CONSOLE_COPY.noError,
            },
          ]}
        />
      </Section>

      <Section title={CONSOLE_COPY.jobs} padded>
        <JobsSummary report={queues} />
      </Section>

      <Section title={VIEW_COPY.adminData} description={VIEW_COPY.adminDataLead} bare>
        <ConsoleMetrics
          metrics={[
            { label: VIEW_COPY.metricAccounts, value: counts.accounts },
            { label: VIEW_COPY.metricCreators, value: counts.creators },
            { label: VIEW_COPY.metricTeams, value: counts.teams },
            { label: VIEW_COPY.metricProjects, value: counts.projects },
            { label: VIEW_COPY.metricTasks, value: counts.tasks },
            { label: VIEW_COPY.metricFiles, value: counts.files },
            { label: VIEW_COPY.metricLogs, value: counts.logs },
            { label: VIEW_COPY.metricNotifications, value: counts.notifications },
          ]}
        />
      </Section>

      <Section title={VIEW_COPY.adminAccess} description={VIEW_COPY.adminAccessLead} bare>
        <ConsoleMetrics
          metrics={[
            { label: VIEW_COPY.metricSessions, value: counts.sessions },
            {
              label: VIEW_COPY.metricTwoFactor,
              value: counts.twoFactor,
              hint: `${counts.accounts} ${VIEW_COPY.metricAccounts.toLowerCase()}`,
            },
          ]}
        />
      </Section>

      <Section title={VIEW_COPY.adminRuntime} description={VIEW_COPY.adminRuntimeLead} padded>
        <RuntimePanel report={runtime} />
      </Section>
    </div>
  )
}
