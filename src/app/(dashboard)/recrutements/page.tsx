import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { RecruitmentsPanel } from '@/composites/recruitment/RecruitmentsPanel'
import { listSessions, sessionFields } from '@/core/services/recruitment'
import { OBSERVER_SCOPE } from '@/core/wrappers/requireRecruitment'
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
  const { access, scope } = await requirePermission([
    Permissions.RecruitmentRead,
    Permissions.RecruitmentObserve,
  ])
  // An observer reads every session, whatever the creator
  const perimeter = access.can(Permissions.RecruitmentRead) ? await scope() : OBSERVER_SCOPE

  const [sessions, fields] = await Promise.all([listSessions(perimeter), sessionFields(perimeter)])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={RECRUITMENT_COPY.title}
        heroDescription={RECRUITMENT_COPY.heroDescription}
      />
      <RecruitmentsPanel
        initialSessions={sessions}
        fields={fields}
        canManage={access.can(Permissions.RecruitmentManage)}
      />
    </div>
  )
}
