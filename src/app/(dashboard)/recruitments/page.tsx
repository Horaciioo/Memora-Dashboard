import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { RecruitmentsView } from '@/composites/recruitment/RecruitmentsView'
import { listSessions, sessionFields } from '@/core/services/recruitment'
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
  // Managers read their creators, the others the sessions they sit in
  const perimeter = await scope()

  const sessions = await listSessions(perimeter)

  // Everyone already seated stays valid in the edit form
  const seated = (key: 'observerIds' | 'recruiterIds' | 'responsableIds') =>
    sessions.flatMap((entry) => entry.values[key] as string[])
  const fields = await sessionFields(perimeter, undefined, seated('observerIds'), {
    recruiters: seated('recruiterIds'),
    responsables: seated('responsableIds'),
  })

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={RECRUITMENT_COPY.title}
        heroDescription={RECRUITMENT_COPY.heroDescription}
      />
      <RecruitmentsView
        initialSessions={sessions}
        fields={fields}
        canManage={access.can(Permissions.RecruitmentManage)}
      />
    </div>
  )
}
