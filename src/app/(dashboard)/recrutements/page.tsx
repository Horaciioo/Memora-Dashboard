import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { RecruitmentsPanel } from '@/composites/recruitment/RecruitmentsPanel'
import { prisma } from '@/core/lib/db'
import { rowsToOptions } from '@/core/lib/forms/options'
import { listSessions, sessionFields } from '@/core/services/recruitment/RecruitmentService'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: RECRUITMENT_COPY.title }

/**
 * Recruitment board, one card per session
 * @return {Promise<JSX.Element>} - Recruitments page
 */

export default async function RecruitmentsPage() {
  const { access, scope } = await requirePermission(Permissions.RecruitmentRead)
  const perimeter = await scope()

  const [sessions, fields, youtubers, functions] = await Promise.all([
    listSessions(perimeter),
    sessionFields(perimeter),
    youtuberOptions(perimeter),
    prisma.jobFunction.findMany({ orderBy: { position: 'asc' } }),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={RECRUITMENT_COPY.title} lead={RECRUITMENT_COPY.lead} />
      <RecruitmentsPanel
        initialSessions={sessions}
        fields={fields}
        youtubers={youtubers}
        functions={rowsToOptions(functions)}
        canManage={access.can(Permissions.RecruitmentManage)}
      />
    </div>
  )
}
