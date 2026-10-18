'use client'

import { useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { DetailGrid } from '@/components/structures/data/DetailGrid'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { SkillGrid } from '@/composites/academy/junior/SkillGrid'
import { DecisionPanel } from '@/composites/academy/review/DecisionPanel'
import { useReviewDesk } from '@/core/hooks/data/academy/useReviewDesk'
import { flowStep } from '@/core/lib/academy/queues'
import { ACADEMY_COPY, ACADEMY_FIELD_COPY, COURSE_COPY } from '@/declarations/academy/copy'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { ACADEMY_STAGE_REGISTRY, REVIEW_ADVICE_REGISTRY } from '@/declarations/academy/registries'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import type { JuniorView } from '@/types/academy'
import { ReviewStatuses } from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'

export interface DecisionFlowProps {
  // Juniors whose check-in waits on a decision, one after the other
  queue: JuniorView[]
  onClose: () => void
}

/**
 * The decisions a responsable owes, kept one junior after the other
 * @param {JuniorView[]} queue - Juniors whose check-in waits
 * @param {() => void} onClose - Leaves the flow
 * @return {JSX.Element | null}
 */

export const DecisionFlow = ({ queue, onClose }: DecisionFlowProps) => {
  const [position, setPosition] = useState(0)
  const junior = queue[position]

  if (!junior) return null

  return (
    <DecisionStep
      key={junior.id}
      junior={junior}
      step={flowStep(position, queue.length)}
      onClose={onClose}
      onDecided={() => (position + 1 < queue.length ? setPosition(position + 1) : onClose())}
    />
  )
}

interface DecisionStepProps {
  junior: JuniorView
  step: string
  onClose: () => void
  onDecided: () => void
}

/**
 * The submitted check-in of one junior and the buttons deciding it
 * @param {DecisionStepProps} props - Junior and where the queue stands
 * @return {JSX.Element}
 */

const DecisionStep = ({ junior, step, onClose, onDecided }: DecisionStepProps) => {
  const desk = useReviewDesk(junior.id)
  const review = desk.reviews.find((entry) => entry.status === ReviewStatuses.Submitted)

  return (
    <Drawer
      open
      isWide
      onClose={onClose}
      title={PARKOUR_COPY.decisionFlowTitle.replace('{name}', junior.displayName)}
      description={step}
      icon={FORM_SUBJECTS.review.icon}
      subheader={<span>{step}</span>}
      footer={
        review && (
          <DecisionPanel
            review={review}
            isSaving={desk.isSaving}
            issues={desk.issues}
            decide={desk.decide}
            onDecided={onDecided}
          />
        )
      }
    >
      {desk.isLoading || !review ? (
        <BrandLoader variant="block" />
      ) : (
        <div className="flex flex-col gap-6">
          <DetailGrid
            entries={[
              {
                label: ACADEMY_COPY.reviewStageLabel,
                value: ACADEMY_STAGE_REGISTRY.label(review.stage),
              },
              { label: ACADEMY_FIELD_COPY.heldAt, value: formatDay(review.heldAt) },
              {
                label: ACADEMY_FIELD_COPY.durationMinutes,
                value: review.durationMinutes ? COURSE_COPY.minutes(review.durationMinutes) : null,
              },
              {
                label: ACADEMY_FIELD_COPY.advice,
                value: REVIEW_ADVICE_REGISTRY.label(review.advice),
              },
              { label: ACADEMY_FIELD_COPY.feeling, value: review.feeling, wide: true },
            ]}
          />
          {review.summary && <Markdown source={review.summary} />}
          <SkillGrid skills={desk.skills} canWrite={false} onGrade={() => undefined} />
        </div>
      )}
    </Drawer>
  )
}
