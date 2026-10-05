import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Status } from '@/components/elements/display/Status'
import { PageHeader } from '@/components/structures/PageHeader'
import { TrainingContentEditor } from '@/composites/academy/TrainingContentEditor'
import { TrainingFeedbackPanel } from '@/composites/academy/TrainingFeedbackPanel'
import { prisma } from '@/core/lib/db'
import { readFeedbackSummary } from '@/core/services/academy/FeedbackService'
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
 * Training content file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Training content file
 */

export default async function TrainingContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access } = await requirePermission(Permissions.ReferenceRead)

  const training = await readTraining(id)
  if (!training) notFound()

  // Reviews stay with the Administration and the Responsables
  const [chapters, feedback] = await Promise.all([
    readTrainingContent(id),
    access.isResponsable ? readFeedbackSummary(id) : null,
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={TRAINING_CONTENT_COPY.title}
        title={training.name}
        actions={
          training.period ? (
            <Status label={ACADEMY_PERIOD_REGISTRY.label(training.period)} tone="neutral" />
          ) : undefined
        }
      />
      <TrainingContentEditor
        trainingId={id}
        initialChapters={chapters}
        canManage={access.can(Permissions.ReferenceManage)}
      />
      {feedback && <TrainingFeedbackPanel summary={feedback} />}
    </div>
  )
}
