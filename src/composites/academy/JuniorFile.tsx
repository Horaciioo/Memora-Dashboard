'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useJuniorFile } from '@/core/hooks/data/useJuniorFile'
import { ACADEMY_COPY, ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toTone } from '@/declarations/ui/theme'
import { LIST_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import type { AcademyReviewView, JuniorView } from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

// Reference collection holding the training modules
const TRAINING_SECTION = 'formations'

export interface JuniorFileProps {
  initialJunior: JuniorView
  initialReviews: AcademyReviewView[]
  juniorFields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  reviewAxes: { name: string; label: string }[]
  canManage: boolean
  canReadReviews: boolean
  canWriteReviews: boolean
}

/**
 * Individual follow-up file, its progression, its voice check-ins and the gesture that validates
 * @param {JuniorView} initialJunior - Junior resolved server-side
 * @param {AcademyReviewView[]} initialReviews - Check-ins resolved server-side
 * @param {FieldDefinition[]} juniorFields - Declarations of the junior form
 * @param {FieldDefinition[]} reviewFields - Declarations of the check-in form
 * @param {{ name: string, label: string }[]} reviewAxes - Axes a check-in walks through
 * @param {boolean} canManage - Member may drive the follow-up
 * @param {boolean} canReadReviews - Member may read the check-ins
 * @param {boolean} canWriteReviews - Member may write a check-in
 * @return {JSX.Element}
 */

export const JuniorFile = ({
  initialJunior,
  initialReviews,
  juniorFields,
  reviewFields,
  reviewAxes,
  canManage,
  canReadReviews,
  canWriteReviews,
}: JuniorFileProps) => {
  const file = useJuniorFile(initialJunior, initialReviews)
  const [dialog, setDialog] = useState<'junior' | 'review' | null>(null)
  const [editingReview, setEditingReview] = useState<AcademyReviewView | null>(null)
  const [pendingReview, setPendingReview] = useState<AcademyReviewView | null>(null)

  const { junior } = file
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)
  const isReady = junior.mandatoryPending === 0

  const openReview = (review: AcademyReviewView | null) => {
    file.clearIssues()
    setEditingReview(review)
    setDialog('review')
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title={ACADEMY_COPY.fileTitle} description={ACADEMY_COPY.fileLead} padded>
        <div className="flex flex-col gap-4">
          <span className="flex flex-wrap items-center gap-2">
            <Badge label={junior.dispositif.name} tone={toTone(junior.dispositif.accent, 'info')} />
            <Badge label={status.label} tone={toTone(status.accent, 'neutral')} dot />
            <Badge
              label={isReady ? ACADEMY_COPY.ready : ACADEMY_COPY.blocked}
              tone={isReady ? 'success' : 'warning'}
            />
            <Button
              variant="primary"
              icon="edit"
              className="ml-auto"
              disabled={!canManage}
              onClick={() => {
                file.clearIssues()
                setDialog('junior')
              }}
            >
              {ACTION_COPY.edit}
            </Button>
          </span>
          <DetailGrid
            entries={[
              { label: ACADEMY_FIELD_COPY.trainer, value: junior.trainer?.name },
              { label: ACADEMY_FIELD_COPY.liveCount, value: String(junior.liveCount) },
              { label: ACADEMY_FIELD_COPY.startsAt, value: formatDay(junior.startedAt) },
              {
                label: ACADEMY_COPY.validate,
                value: junior.validatedAt ? formatDay(junior.validatedAt) : undefined,
              },
              { label: ACADEMY_FIELD_COPY.juniorSummary, value: junior.summary },
            ]}
          />
        </div>
      </Section>

      <Section title={ACADEMY_COPY.progression} description={ACADEMY_COPY.progressionLead} bare>
        {junior.trainings.length === 0 ? (
          <EmptyState
            figure="academy"
            title={ACADEMY_COPY.noTrainingsTitle}
            description={ACADEMY_COPY.noTrainingsDescription}
            action={
              <Link href={ROUTES.settingsSection(TRAINING_SECTION)}>
                <Button variant="primary" icon="settings">
                  {ACADEMY_COPY.configure}
                </Button>
              </Link>
            }
          />
        ) : (
          <div
            className={cn(
              SECTION_STYLES.panel,
              SECTION_STYLES.panelPadded,
              'flex flex-col gap-0.5'
            )}
          >
            {junior.trainings.map((training) => (
              <Checkbox
                key={training.id}
                checked={training.completedAt !== null}
                disabled={!canManage || file.isSaving}
                onChange={(checked) => void file.setTraining(training.id, checked)}
                label={training.name}
                hint={
                  training.completedAt
                    ? [formatDay(training.completedAt), training.validatorName]
                        .filter(Boolean)
                        .join(' · ')
                    : training.mandatory
                      ? ACADEMY_COPY.mandatory
                      : undefined
                }
              />
            ))}
          </div>
        )}
      </Section>

      <Section title={ACADEMY_COPY.reviews} description={ACADEMY_COPY.reviewsLead} bare>
        {!canReadReviews ? (
          <EmptyState
            figure="notes"
            title={ACADEMY_COPY.confidential}
            description={ACADEMY_COPY.reviewLocked}
            action={
              <Button icon="blocked" disabled>
                {ACADEMY_COPY.confidential}
              </Button>
            }
          />
        ) : file.reviews.length === 0 ? (
          <EmptyState
            figure="notes"
            title={ACADEMY_COPY.reviewEmptyTitle}
            description={ACADEMY_COPY.reviewEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!canWriteReviews}
                onClick={() => openReview(null)}
              >
                {ACADEMY_COPY.reviewAdd}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {file.reviews.map((review) => (
              <article key={review.id} className={LIST_STYLES.card}>
                <header className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{formatDay(review.heldAt)}</span>
                  {review.authorName && (
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {review.authorName}
                    </span>
                  )}
                  <Button
                    variant="icon"
                    icon="edit"
                    aria-label={ACTION_COPY.edit}
                    className="ml-auto"
                    disabled={!canWriteReviews}
                    onClick={() => openReview(review)}
                  />
                  <Button
                    variant="icon"
                    icon="remove"
                    aria-label={ACTION_COPY.delete}
                    disabled={!canWriteReviews}
                    onClick={() => setPendingReview(review)}
                  />
                </header>
                <DetailGrid
                  entries={[
                    { label: ACADEMY_FIELD_COPY.feeling, value: review.feeling },
                    ...reviewAxes.map((axis) => ({
                      label: axis.label,
                      value: review.axes[axis.name],
                    })),
                    { label: ACADEMY_FIELD_COPY.objectives, value: review.objectives },
                    { label: ACADEMY_FIELD_COPY.strategies, value: review.strategies },
                  ]}
                />
                {review.summary && <Markdown source={review.summary} />}
              </article>
            ))}
            <AddRow
              label={ACADEMY_COPY.reviewAdd}
              disabled={!canWriteReviews}
              onClick={() => openReview(null)}
            />
          </div>
        )}
      </Section>

      <FormDialog
        open={dialog === 'junior'}
        title={junior.displayName}
        fields={juniorFields}
        initialValues={junior.values}
        issues={file.issues}
        isSaving={file.isSaving}
        size="lg"
        onSubmit={file.save}
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'review'}
        title={editingReview ? ACTION_COPY.edit : ACADEMY_COPY.reviewAdd}
        description={ACADEMY_COPY.reviewsLead}
        fields={reviewFields}
        initialValues={editingReview?.values}
        issues={file.issues}
        isSaving={file.isSaving}
        size="lg"
        onSubmit={(values) =>
          editingReview ? file.editReview(editingReview.id, values) : file.addReview(values)
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={pendingReview !== null}
        title={ACADEMY_COPY.reviewDeleteTitle}
        description={ACADEMY_COPY.reviewDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingReview(null)}
        onConfirm={async () => {
          await file.dropReview(pendingReview!.id)
          setPendingReview(null)
        }}
      />
    </div>
  )
}
