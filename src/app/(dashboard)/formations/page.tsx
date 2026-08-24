import type { Metadata } from 'next'
import { Badge } from '@/components/elements/display/Badge'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageHeader } from '@/components/structures/PageHeader'
import { TrainingsPanel } from '@/composites/academy/TrainingsPanel'
import { myTrainings, resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { requireStatus } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { MemberStatuses } from '@/utils/constants/hierarchy'

export const metadata: Metadata = { title: ACADEMY_COPY.myTrainingsTitle }

/**
 * A junior's own training progression, scoped to their active FSI
 * @return {Promise<JSX.Element>} - Trainings page
 */

export default async function TrainingsPage() {
  const { session } = await requireStatus(MemberStatuses.Academy)

  const junior = await resolveOwnJunior(session.id)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.myTrainingsTitle} lead={ACADEMY_COPY.myTrainingsLead} />
      {junior ? (
        <TrainingsPanel
          initialTrainings={await myTrainings(
            session.id,
            junior.session.functionId,
            junior.dispositifId
          )}
        />
      ) : (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.myTrainingsNoFsiTitle}
          description={ACADEMY_COPY.myTrainingsNoFsiDescription}
          action={<Badge label={ACADEMY_COPY.myTrainingsNoFsiTitle} tone="neutral" />}
        />
      )}
    </div>
  )
}
