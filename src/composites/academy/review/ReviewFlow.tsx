'use client'

import { useState } from 'react'

import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { SkillGrid } from '@/composites/academy/junior/SkillGrid'
import { useReviewDesk } from '@/core/hooks/data/academy/useReviewDesk'
import { reviewStageOf } from '@/core/lib/academy/parkour'
import { flowStep } from '@/core/lib/academy/queues'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import type { JuniorView } from '@/types/academy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { ReviewStatuses } from '@/utils/constants/hierarchy'
import { toDayKey } from '@/utils/format/calendar'

export interface ReviewFlowProps {
  // Juniors owing a check-in, one after the other
  queue: JuniorView[]
  fields: FieldDefinition[]
  onClose: () => void
}

/**
 * The check-ins a trainer owes, written one junior after the other
 * @param {JuniorView[]} queue - Juniors owing a check-in
 * @param {FieldDefinition[]} fields - Declarations of the check-in form
 * @param {() => void} onClose - Leaves the flow
 * @return {JSX.Element | null}
 */

export const ReviewFlow = ({ queue, fields, onClose }: ReviewFlowProps) => {
  const [position, setPosition] = useState(0)
  const junior = queue[position]

  if (!junior) return null

  return (
    <ReviewStep
      key={junior.id}
      junior={junior}
      step={flowStep(position, queue.length)}
      fields={fields}
      onClose={onClose}
      onFiled={() => (position + 1 < queue.length ? setPosition(position + 1) : onClose())}
    />
  )
}

interface ReviewStepProps {
  junior: JuniorView
  step: string
  fields: FieldDefinition[]
  onClose: () => void
  onFiled: () => void
}

/**
 * The check-in of one junior, its competencies beside the form
 * @param {ReviewStepProps} props - Junior and where the queue stands
 * @return {JSX.Element | null}
 */

const ReviewStep = ({ junior, step, fields, onClose, onFiled }: ReviewStepProps) => {
  const desk = useReviewDesk(junior.id)
  const stage = reviewStageOf(junior.stage)
  const title = PARKOUR_COPY.reviewFlowTitle.replace('{name}', junior.displayName)

  if (!stage) return null

  if (desk.isLoading) {
    return (
      <Drawer
        open
        onClose={onClose}
        title={title}
        description={step}
        icon={FORM_SUBJECTS.review.icon}
      >
        <BrandLoader variant="block" />
      </Drawer>
    )
  }

  const draft = desk.reviews.find(
    (review) => review.status === ReviewStatuses.Draft && review.stage === stage
  )
  const initial: FormValues = draft?.values ?? { stage, heldAt: toDayKey(new Date()) }

  return (
    <FormDrawer
      open
      subject={FORM_SUBJECTS.review}
      title={title}
      description={step}
      note={step}
      fields={fields.map((field) =>
        field.name === 'stage' ? { ...field, readOnly: true } : field
      )}
      initialValues={initial}
      issues={desk.issues}
      isSaving={desk.isSaving}
      submitVerb={PARKOUR_COPY.depositVerb}
      aside={{
        label: PARKOUR_COPY.skillsPanel,
        render: () => (
          <SkillGrid
            skills={desk.skills}
            canWrite={!desk.isSaving}
            onGrade={(skillId, percent) => void desk.setSkill(skillId, percent)}
          />
        ),
      }}
      onSubmit={async (values) => {
        // The queue moves on by itself, the drawer stays for the next one
        if (await desk.fileReview({ ...values, stage })) onFiled()

        return false
      }}
      onClose={onClose}
    />
  )
}
