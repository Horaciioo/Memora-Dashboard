import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { AcademyPanel } from '@/composites/academy/AcademyPanel'
import { prisma } from '@/core/lib/db'
import { listJuniors } from '@/core/services/academy/AcademyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ACADEMY_COPY.title }

/**
 * Academy board
 * @return {Promise<JSX.Element>} - Academy page
 */

export default async function AcademyPage() {
  const { access } = await requirePermission(Permissions.AcademyRead)

  const [juniors, trainingCount] = await Promise.all([listJuniors(), prisma.training.count()])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.title} lead={ACADEMY_COPY.lead} />
      <AcademyPanel
        initialJuniors={juniors}
        hasTrainings={trainingCount > 0}
        canManage={access.can(Permissions.AcademyManage)}
      />
    </div>
  )
}
