'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import type { ReviewDecisionInput } from '@/core/hooks/data/academy/useJuniorFile'
import { decisionsFor } from '@/core/lib/academy/parkour'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import {
  PARKOUR_COPY,
  PARKOUR_DECISION_CONFIRM,
  PARKOUR_DECISIONS,
  THIRD_PERIOD_FIELDS,
} from '@/declarations/academy/parkour'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { REVIEW_CARD } from '@/declarations/ui/variants'
import type { AcademyReviewView } from '@/types/academy'
import type { FieldIssue } from '@/types/forms'
import { AcademyStages, ReviewAdvices } from '@/utils/constants/hierarchy'
import type { ReviewAdviceName } from '@/utils/constants/hierarchy'

// Look of the button giving each outcome
const decisionVariant = (decision: ReviewAdviceName) =>
  decision === ReviewAdvices.Stop
    ? 'danger'
    : decision === ReviewAdvices.Pass
      ? 'primary'
      : 'secondary'

export interface DecisionPanelProps {
  review: AcademyReviewView
  isSaving: boolean
  issues: FieldIssue[]
  decide: (id: string, input: ReviewDecisionInput) => Promise<boolean>
  // Runs once a decision is kept
  onDecided?: () => void
}

/**
 * Buttons keeping an outcome on a submitted check-in, each behind its confirmation
 * @param {DecisionPanelProps} props - Check-in and the way to decide it
 * @return {JSX.Element}
 */

export const DecisionPanel = ({
  review,
  isSaving,
  issues,
  decide,
  onDecided,
}: DecisionPanelProps) => {
  // Outcome waiting for its confirmation, none when the check-in goes back
  const [deciding, setDeciding] = useState<{ decision: ReviewAdviceName | null } | null>(null)
  const labels = PARKOUR_DECISIONS[review.stage] ?? {}

  // A third period asks for its deadline in a drawer
  const opensThirdPeriod =
    deciding?.decision === ReviewAdvices.Bonus && review.stage === AcademyStages.ReviewFinal

  const settle = async (values?: { deadlineAt?: string; decisionNote?: string }) => {
    if (!deciding) return false

    const done = await decide(review.id, {
      decision: deciding.decision ?? undefined,
      bounce: deciding.decision === null,
      ...values,
    })
    if (done) {
      setDeciding(null)
      onDecided?.()
    }

    return done
  }

  return (
    <div className={REVIEW_CARD.actions}>
      <Button variant="ghost" icon="back" onClick={() => setDeciding({ decision: null })}>
        {PARKOUR_COPY.bounce}
      </Button>
      {decisionsFor(review.stage).map((decision) => (
        <Button
          key={decision}
          variant={decisionVariant(decision)}
          icon={decision === ReviewAdvices.Stop ? 'close' : 'confirm'}
          onClick={() => setDeciding({ decision })}
        >
          {labels[decision]}
        </Button>
      ))}

      <ConfirmDialog
        open={deciding !== null && !opensThirdPeriod}
        title={deciding?.decision ? (labels[deciding.decision] ?? '') : PARKOUR_COPY.bounce}
        description={
          deciding?.decision
            ? PARKOUR_DECISION_CONFIRM[deciding.decision]
            : ACADEMY_COPY.reviewRejectDescription
        }
        tone={deciding?.decision === ReviewAdvices.Stop ? 'danger' : 'success'}
        pending={isSaving}
        onCancel={() => setDeciding(null)}
        onConfirm={async () => {
          await settle()
        }}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.review}
        open={opensThirdPeriod}
        title={PARKOUR_DECISIONS[AcademyStages.ReviewFinal]?.[ReviewAdvices.Bonus] ?? ''}
        description={PARKOUR_DECISION_CONFIRM[ReviewAdvices.Bonus]}
        fields={THIRD_PERIOD_FIELDS}
        issues={issues}
        isSaving={isSaving}
        onSubmit={(values) =>
          settle({
            deadlineAt: typeof values.deadlineAt === 'string' ? values.deadlineAt : undefined,
            decisionNote: typeof values.decisionNote === 'string' ? values.decisionNote : undefined,
          })
        }
        onClose={() => setDeciding(null)}
      />
    </div>
  )
}
