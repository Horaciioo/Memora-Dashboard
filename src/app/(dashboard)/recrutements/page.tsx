import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { RecruitmentsPanel } from '@/composites/recruitment/RecruitmentsPanel'
import { listSessions, sessionFields } from '@/core/services/recruitment/RecruitmentService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: RECRUITMENT_COPY.title }

/**
 * Recruitment board
 * @return {Promise<JSX.Element>} - Recruitments page
 */

export default async function RecruitmentsPage() {
  const { access, scope } = await requirePermission(Permissions.RecruitmentRead)
  const perimeter = await scope()

  const [sessions, fields] = await Promise.all([listSessions(perimeter), sessionFields(perimeter)])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={RECRUITMENT_COPY.title} />
      <RecruitmentsPanel
        initialSessions={sessions}
        fields={fields}
        canManage={access.can(Permissions.RecruitmentManage)}
      />
    </div>
  )
}
