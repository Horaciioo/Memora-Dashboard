import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { AcademyTabs } from '@/composites/academy/AcademyTabs'
import { SessionsPanel } from '@/composites/academy/SessionsPanel'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { listSessions, sessionFields } from '@/core/services/academy/AcademyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ACADEMY_COPY.title }

/**
 * Academy board, one card per session
 * @return {Promise<JSX.Element>} - Academy page
 */

export default async function AcademyPage() {
  const { session, access } = await requirePermission(Permissions.AcademyRead)
  const [sessions, fields] = await Promise.all([
    listSessions(academyScope(session, access)),
    sessionFields(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.title} lead={ACADEMY_COPY.lead} />
      <AcademyTabs />
      <SessionsPanel
        initialSessions={sessions}
        fields={fields}
        canManage={access.can(Permissions.AcademyManage)}
      />
    </div>
  )
}
