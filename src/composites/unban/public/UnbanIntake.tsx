'use client'

import { useMemo, useState } from 'react'

import { FormWizard } from '@/components/structures/overlays/FormWizard'
import type { WizardStep } from '@/components/structures/overlays/FormWizard'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { useSessionDraft } from '@/core/hooks/interaction/state/useSessionDraft'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { groupQuestions } from '@/core/lib/unban/steps'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { CONTACT_FIELDS } from '@/declarations/unban/form'
import { UNBAN_PUBLIC_STYLES } from '@/declarations/ui/variants'
import { UNBAN_FORM_FIELDS } from '@/utils/constants/unban'
import { IntakeIntro, IntakeReview } from './IntakeSteps'
import { UnbanDone } from './UnbanDone'
import type { UnbanPageGroup } from '@/declarations/unban/form'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { SubmitOutcome, UnbanIdentityView } from '@/types/unban'

// Stable reference, an empty form
const EMPTY_FORM: FormValues = {}

export interface UnbanIntakeProps {
  slug: string
  // Key of the draft, derived from the link and never the link itself
  draftKey: string
  pages: UnbanPageGroup[]
  typedFields: FieldDefinition[]
  fillToken: string
  intro?: string
  outro?: string
  identity: UnbanIdentityView | null
  // Address each option leads to, by option identifier
  redirects: Record<string, string>
}

/**
 * Public form, step by step, up to the review that sends it
 * @param {UnbanIntakeProps} props - Component props
 * @return {JSX.Element}
 */

export const UnbanIntake = ({
  slug,
  draftKey,
  pages,
  typedFields,
  fillToken,
  intro,
  outro,
  identity,
  redirects,
}: UnbanIntakeProps) => {
  const [values, setValues, eraseDraft] = useSessionDraft<FormValues>(draftKey, EMPTY_FORM)
  const [trap, setTrap] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null)
  const [hasFailed, setFailed] = useState(false)
  const { isSaving, issues, run } = useMutation()

  const onChange = (name: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [name]: value }))

    // A choice that leads elsewhere sends the person there
    if (typeof value === 'string' && redirects[value]) window.location.assign(redirects[value])
  }

  const steps: WizardStep[] = useMemo(() => {
    const questions = pages.flatMap((page) =>
      groupQuestions(page.fields).map((group, position) => ({
        id: `questions-${page.id}-${position}`,
        label: page.title ?? UNBAN_PUBLIC_COPY.questionsStep,
        fields: group,
      }))
    )
    const typed = typedFields.length
      ? [{ id: 'typed', label: UNBAN_PUBLIC_COPY.typedIdStep, fields: typedFields }]
      : []

    return [
      {
        id: 'intro',
        label: identity ? UNBAN_PUBLIC_COPY.identityStep : UNBAN_PUBLIC_COPY.introStep,
        render: <IntakeIntro intro={intro} identity={identity} />,
      },
      ...typed,
      ...questions,
      { id: 'contact', label: UNBAN_PUBLIC_COPY.contactStep, fields: CONTACT_FIELDS },
      {
        id: 'review',
        label: UNBAN_PUBLIC_COPY.reviewStep,
        blocked: !confirmed,
        renderWith: (goTo) => (
          <IntakeReview
            sections={questions}
            values={values}
            outro={outro}
            confirmed={confirmed}
            onConfirm={setConfirmed}
            goTo={goTo}
          />
        ),
      },
    ]
  }, [confirmed, identity, intro, outro, pages, typedFields, values])

  const submit = async () => {
    const body = { ...values, [UNBAN_FORM_FIELDS.fillToken]: fillToken, [UNBAN_FORM_FIELDS.trap]: trap }
    const result = await run(() => apiPost<SubmitOutcome>(API_ROUTES.unbanSubmit(slug), body))

    setFailed(result === null)
    if (!result) return

    eraseDraft()
    setOutcome(result)
  }

  if (outcome) return <UnbanDone outcome={outcome} />

  return (
    <div className="relative">
      <FormWizard
        steps={steps}
        values={values}
        issues={issues}
        onChange={onChange}
        onSubmit={() => void submit()}
        label={UNBAN_PUBLIC_COPY.progressLabel}
        nextLabel={UNBAN_PUBLIC_COPY.next}
        previousLabel={UNBAN_PUBLIC_COPY.previous}
        submitLabel={hasFailed ? UNBAN_PUBLIC_COPY.retry : UNBAN_PUBLIC_COPY.submit}
        disabled={isSaving}
        isLoading={isSaving}
        idPrefix="unban"
      />
      <input
        className={UNBAN_PUBLIC_STYLES.trap}
        name={UNBAN_FORM_FIELDS.trap}
        value={trap}
        onChange={(event) => setTrap(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
    </div>
  )
}
