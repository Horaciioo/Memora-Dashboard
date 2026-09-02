import type { Metadata } from 'next'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { RuntimePanel } from '@/composites/system/RuntimePanel'
import { readRuntimeReport } from '@/core/services/system/ConsoleService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { VIEW_COPY } from '@/declarations/access/copy'
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

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={SYSTEM_COPY.probesTitle}
        lead={SYSTEM_COPY.probesLead}
        actions={
          <Badge
            label={`${VIEW_COPY.environment} · ${runtime.label}`}
            tone={runtime.started ? 'success' : 'neutral'}
            icon="console"
          />
        }
      />

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
