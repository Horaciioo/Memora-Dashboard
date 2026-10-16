import type { Metadata } from 'next'
import { Status } from '@/components/elements/display/Status'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { StatusPanel } from '@/composites/system/status/StatusPanel'
import { RuntimePanel } from '@/composites/system/RuntimePanel'
import { readRuntimeReport } from '@/core/services/system/ConsoleService'
import { readStatusReport } from '@/core/services/system/StatusService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { VIEW_COPY } from '@/declarations/access/copy'
import { CONSOLE_COPY } from '@/declarations/system/monitoring/console'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.probesTitle }

/**
 * Every back-end subject as the last probe saw it
 * @return {Promise<JSX.Element>} - Probes page
 */

export default async function ProbesPage() {
  await requirePermission(Permissions.AccessManage)

  const runtime = readRuntimeReport()
  const status = await readStatusReport()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={SYSTEM_COPY.probesTitle}
        actions={
          <Status
            label={`${VIEW_COPY.environment} : ${runtime.label}`}
            tone={runtime.started ? 'success' : 'neutral'}
            icon="console"
          />
        }
      />

      <Section title={CONSOLE_COPY.probesHistory} padded>
        <StatusPanel report={status} />
      </Section>

      <Section title={CONSOLE_COPY.probesIncidents} padded>
        <StatusPanel report={status} show={['incidents']} />
      </Section>

      <Section
        title={SYSTEM_COPY.probesSubjects}
        description={SYSTEM_COPY.probesSubjectsLead}
        padded
      >
        <RuntimePanel report={runtime} />
      </Section>
    </div>
  )
}
