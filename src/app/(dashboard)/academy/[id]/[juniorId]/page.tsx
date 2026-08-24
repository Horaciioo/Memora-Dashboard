import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { JuniorFile } from '@/composites/academy/JuniorFile'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  ACADEMY_REVIEW_AXES,
  REVIEW_FIELDS,
  juniorFields,
  listReviews,
  readJunior,
} from '@/core/services/academy/AcademyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { formatDay } from '@/utils/format/dates'

/**
 * Name the browser tab after the junior
 * @param {Object} context - Route context
 * @param {Promise<{ juniorId: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ juniorId: string }>
}): Promise<Metadata> {
  const { juniorId } = await params
  const { session, access } = await requirePermission(Permissions.AcademyRead)

  try {
    const { junior } = await readJunior(juniorId, academyScope(session, access))

    return { title: junior.displayName }
  } catch {
    return { title: ACADEMY_COPY.fileTitle }
  }
}

/**
 * Individual follow-up file of one junior
 * @param {Object} context - Route context
 * @param {Promise<{ juniorId: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Follow-up file
 */

export default async function JuniorPage({ params }: { params: Promise<{ juniorId: string }> }) {
  const { juniorId } = await params
  const { session, access } = await requirePermission(Permissions.AcademyRead)
  const scope = academyScope(session, access)

  const found = await readJunior(juniorId, scope).catch(() => null)
  if (!found) notFound()

  const canReadReviews = access.can(Permissions.AcademyReviewRead)

  const [fields, reviews] = await Promise.all([
    juniorFields(found.junior.sessionId),
    canReadReviews ? listReviews(juniorId, scope) : Promise.resolve([]),
  ])

  const jobFunction = found.session.function

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={`${jobFunction.name} • ${formatDay(found.session.startsAt)}`}
        title={found.junior.displayName}
      />
      <JuniorFile
        initialJunior={found.junior}
        initialReviews={reviews}
        juniorFields={fields}
        reviewFields={REVIEW_FIELDS}
        reviewAxes={[...ACADEMY_REVIEW_AXES]}
        canManage={access.can(Permissions.AcademyManage)}
        canReadReviews={canReadReviews}
        canWriteReviews={access.can(Permissions.AcademyReviewWrite)}
      />
    </div>
  )
}
