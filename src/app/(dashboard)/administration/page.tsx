import type { Metadata } from 'next'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { ConsoleBanner } from '@/composites/system/ConsoleBanner'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { RuntimePanel } from '@/composites/system/RuntimePanel'
import { readDataReport, readRuntimeReport } from '@/core/services/system/ConsoleService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { VIEW_COPY } from '@/declarations/access/copy'
import { NavigationViews } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: VIEW_COPY.adminTitle }

/**
 * Admin console
 * @return {Promise<JSX.Element>} - Console page
 */

export default async function AdministrationPage() {
  const { scope } = await requirePermission(Permissions.AccessManage)

  const data = await readDataReport(await scope())
  const runtime = readRuntimeReport()

  const { counts } = data

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={VIEW_COPY.adminTitle} lead={VIEW_COPY.adminLead} />

      <ConsoleBanner
        view={NavigationViews.Administration}
        title={`${VIEW_COPY.environment} · ${runtime.label}`}
        lead={runtime.started ? VIEW_COPY.adminRuntimeLead : VIEW_COPY.runtimeDownLead}
        aside={
          <Badge
            label={runtime.encrypted ? VIEW_COPY.subjectOn : VIEW_COPY.subjectOff}
            tone={runtime.encrypted ? 'success' : 'neutral'}
            icon={runtime.encrypted ? 'lock' : 'unlock'}
          />
        }
      />

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
