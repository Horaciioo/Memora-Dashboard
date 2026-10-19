'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { Status } from '@/components/elements/display/Status'
import { EditableDetailGrid } from '@/components/structures/inline/EditableDetailGrid'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { DecisionPanel } from '@/composites/academy/review/DecisionPanel'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import { advicesFor } from '@/core/lib/academy/parkour'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  ACADEMY_COPY,
  ACADEMY_FIELD_COPY,
  COURSE_COPY,
  REVIEW_ENTITY,
} from '@/declarations/academy/copy'
import { PARKOUR_COPY, PARKOUR_DECISIONS } from '@/declarations/academy/parkour'
import {
  ACADEMY_STAGE_REGISTRY,
  REVIEW_ADVICE_REGISTRY,
  REVIEW_STATUS_REGISTRY,
} from '@/declarations/academy/registries'
import { REVIEW_CARD } from '@/declarations/ui/variants'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { useMenu } from '@/managers/front-end'
import type { AcademyReviewView } from '@/types/academy'
import { AcademyStages, ReviewAdvices, ReviewStatuses } from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'

export interface ReviewCardProps {
  review: AcademyReviewView
}

/**
 * One voice check-in: every value is written in place while it is a draft
 * @param {AcademyReviewView} review - Check-in rendered
 * @return {JSX.Element}
 */

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const { file, fields, can, setPendingReview } = useJuniorState()
  const { contextMenu } = useMenu()
  const record = useRecordFile({
    path: API_ROUTES.review(review.id),
    entity: REVIEW_ENTITY,
    initialValues: review.values,
  })

  const status = REVIEW_STATUS_REGISTRY.get(review.status)
  const isDraft = review.status === ReviewStatuses.Draft
  const isSubmitted = review.status === ReviewStatuses.Submitted
  const labels = PARKOUR_DECISIONS[review.stage] ?? {}
  const asksAdvice = advicesFor(review.stage).length > 0

  const fieldFor = (name: string) => fields.review.find((field) => field.name === name)!
  const text = (name: string) =>
    typeof record.values[name] === 'string' ? (record.values[name] as string) : ''
  const advice = text('advice') as keyof typeof REVIEW_ADVICE_REGISTRY.map
  const minutes = record.values.durationMinutes

  const entries: EditableEntry[] = [
    {
      label: ACADEMY_FIELD_COPY.heldAt,
      field: fieldFor('heldAt'),
      display: text('heldAt') ? formatDay(text('heldAt')) : null,
    },
    {
      label: ACADEMY_FIELD_COPY.durationMinutes,
      field: fieldFor('durationMinutes'),
      display: typeof minutes === 'number' ? COURSE_COPY.minutes(minutes) : null,
    },
    ...(asksAdvice
      ? [
          {
            label: ACADEMY_FIELD_COPY.advice,
            field: fieldFor('advice'),
            display: advice ? (
              <Status
                label={REVIEW_ADVICE_REGISTRY.label(advice)}
                accent={REVIEW_ADVICE_REGISTRY.get(advice).accent}
              />
            ) : null,
          },
        ]
      : []),
    {
      label: ACADEMY_FIELD_COPY.feeling,
      field: fieldFor('feeling'),
      display: text('feeling') || null,
      wide: true,
    },
    {
      label: ACADEMY_FIELD_COPY.reviewSummary,
      field: fieldFor('summary'),
      display: text('summary') ? <Markdown source={text('summary')} /> : null,
      wide: true,
    },
  ]

  return (
    <article
      className={REVIEW_CARD.root}
      onContextMenu={contextMenu(
        [
          {
            id: 'delete',
            label: ACTION_COPY.delete,
            icon: 'remove',
            danger: true,
            disabled: !can.writeReviews || review.status === ReviewStatuses.Validated,
            onSelect: () => setPendingReview(review),
          },
        ],
        ACADEMY_STAGE_REGISTRY.label(review.stage)
      )}
    >
      <header className={REVIEW_CARD.head}>
        <h3 className={REVIEW_CARD.title}>{ACADEMY_STAGE_REGISTRY.label(review.stage)}</h3>
        <span className={REVIEW_CARD.meta}>
          <Dotted items={[review.authorName, formatDay(review.heldAt)]} />
        </span>
        <span className={REVIEW_CARD.tags}>
          <Status label={status.label} accent={status.accent} />
          {review.decision && labels[review.decision] && (
            <Status
              label={labels[review.decision] ?? ''}
              accent={review.decision === ReviewAdvices.Stop ? 'danger' : 'success'}
            />
          )}
        </span>
        <span className={REVIEW_CARD.headActions}>
          {isDraft && can.writeReviews && (
            <Button
              variant="primary"
              icon="forward"
              isLoading={file.isSaving}
              onClick={() => void file.submitReview(review.id)}
            >
              {review.stage === AcademyStages.ReviewOne
                ? PARKOUR_COPY.submitFirst
                : PARKOUR_COPY.submit}
            </Button>
          )}
        </span>
      </header>

      {isDraft && review.decisionNote && (
        <p className={REVIEW_CARD.decision}>
          <span className={REVIEW_CARD.decisionTitle}>{ACADEMY_COPY.reviewRejected}</span>
          {review.decisionNote}
        </p>
      )}

      <EditableDetailGrid
        entries={entries}
        values={record.values}
        issues={record.issues}
        disabled={!isDraft || !can.writeReviews}
        onCommit={record.saveField}
      />

      {review.decidedAt && (
        <p className={REVIEW_CARD.decision}>
          <span className={REVIEW_CARD.decisionTitle}>
            <Dotted
              items={[
                ACADEMY_COPY.reviewDecisionTitle,
                review.decidedByName,
                formatDay(review.decidedAt),
              ]}
            />
          </span>
          {review.decisionNote}
        </p>
      )}

      {isSubmitted && can.validateReviews && (
        <DecisionPanel
          review={review}
          isSaving={file.isSaving}
          issues={file.issues}
          decide={file.decideReview}
        />
      )}
    </article>
  )
}
