import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { TrainingContentEditor } from '@/composites/academy/TrainingContentEditor'
import { prisma } from '@/core/lib/db'
import { readTrainingContent } from '@/core/services/academy/TrainingContentService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_PERIOD_REGISTRY } from '@/declarations/access/roles'
import { TRAINING_CONTENT_COPY } from '@/declarations/academy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read the training a chapter list belongs to
 * @param {string} id - Training identifier
 * @return {Promise<{ id: string, name: string, summary: string | null, period: string | null } | null>} - Training row
 */

const readTraining = (id: string) =>
  prisma.training.findUnique({
    where: { id },
    select: { id: true, name: true, summary: true, period: true },
  })

/**
 * Name the browser tab after the training
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const training = await readTraining(id)

  return { title: training?.name ?? TRAINING_CONTENT_COPY.title }
}

/**
 * Training content file, chapters and quizzes authored straight from here
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Training content file
 */

export default async function TrainingContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access } = await requirePermission(Permissions.ReferenceRead)

  const training = await readTraining(id)
  if (!training) notFound()

  const chapters = await readTrainingContent(id)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={TRAINING_CONTENT_COPY.title}
        title={training.name}
        lead={training.summary ?? undefined}
        actions={
          training.period ? (
            <Badge label={ACADEMY_PERIOD_REGISTRY.label(training.period)} tone="neutral" />
          ) : undefined
        }
      />
      <TrainingContentEditor
        trainingId={id}
        initialChapters={chapters}
        canManage={access.can(Permissions.ReferenceManage)}
      />
    </div>
  )
}
