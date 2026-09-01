'use client'

import { useMemo, useState } from 'react'

import { FormWizard, type WizardStep } from '@/components/structures/FormWizard'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { groupFields } from '@/core/lib/forms'
import { DiscordIdentityStep } from '@/composites/onboarding/DiscordIdentityStep'
import {
  ONBOARDING_COPY,
  ONBOARDING_NOTICE_COPY,
  ONBOARDING_STEP_COPY,
} from '@/declarations/onboarding/copy'
import type { IntegrationErrorName } from '@/declarations/onboarding/failures'
import { ONBOARDING_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { IntegrationClaimView } from '@/types/onboarding'

export interface OnboardingWizardProps {
  token: string
  fields: FieldDefinition[]
  claim: IntegrationClaimView | null
  failure: IntegrationErrorName | null
}

/**
 * What a submitted form answers with
 * @typedef {Object} SubmitOutcome
 * @property {string | null} accountId - Account opened, when the mode opens one
 * @property {boolean} awaitsApproval - Account held until a responsable validates it
 */

interface SubmitOutcome {
  accountId: string | null
  awaitsApproval: boolean
}

/**
 * Notice a step owes the person, drawn under its fields
 * @type {Record<string, string>}
 */

const STEP_NOTICES: Record<string, string> = {
  [ONBOARDING_STEP_COPY.constraints]: ONBOARDING_NOTICE_COPY.constraints,
  [ONBOARDING_STEP_COPY.preferences]: ONBOARDING_NOTICE_COPY.preferences,
  [ONBOARDING_STEP_COPY.confirmation]: ONBOARDING_NOTICE_COPY.retention,
}

/**
 * Supporting line of each step, keyed on its group name
 * @type {Record<string, string>}
 */

const STEP_HINTS: Record<string, string> = {
  [ONBOARDING_STEP_COPY.informations]: ONBOARDING_STEP_COPY.informationsHint,
  [ONBOARDING_STEP_COPY.socials]: ONBOARDING_STEP_COPY.socialsHint,
  [ONBOARDING_STEP_COPY.constraints]: ONBOARDING_STEP_COPY.constraintsHint,
  [ONBOARDING_STEP_COPY.preferences]: ONBOARDING_STEP_COPY.preferencesHint,
  [ONBOARDING_STEP_COPY.confirmation]: ONBOARDING_STEP_COPY.confirmationHint,
}

/**
 * Public integration form, the identity gate first then the declared groups
 * @param {string} token - Link token
 * @param {FieldDefinition[]} fields - Declarations of the integration form
 * @param {IntegrationClaimView | null} claim - Identity the server resolved
 * @param {IntegrationErrorName | null} failure - Why the last attempt was refused
 * @return {JSX.Element}
 */

export const OnboardingWizard = ({ token, fields, claim, failure }: OnboardingWizardProps) => {
  const [values, setValues] = useState<FormValues>({})
  const [confirmed, setConfirmed] = useState(false)
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null)
  const { isSaving, issues, run } = useMutation()

  const onChange = (name: string, value: FieldValue) =>
    setValues((current) => ({ ...current, [name]: value }))

  // The declared groups become the steps, the identity gate leading them
  const steps: WizardStep[] = useMemo(() => {
    const identity: WizardStep = {
      id: 'identity',
      label: ONBOARDING_STEP_COPY.identity,
      hint: ONBOARDING_STEP_COPY.identityHint,
      blocked: !claim || !confirmed,
      render: (
        <DiscordIdentityStep
          token={token}
          claim={claim}
          failure={failure}
          confirmed={confirmed}
          onConfirm={setConfirmed}
        />
      ),
    }

    const declared = groupFields(fields, values).map((group) => ({
      id: group.name,
      label: group.name,
      hint: STEP_HINTS[group.name],
      fields: group.fields,
      notice: STEP_NOTICES[group.name] ? (
        <p className={ONBOARDING_STYLES.notice}>{STEP_NOTICES[group.name]}</p>
      ) : undefined,
    }))

    return [identity, ...declared]
  }, [claim, confirmed, failure, fields, token, values])

  const submit = async () => {
    const result = await run(() => apiPost<SubmitOutcome>(API_ROUTES.integration(token), values))

    if (result) setOutcome(result)
  }

  if (outcome) {
    const description = !outcome.accountId
      ? ONBOARDING_COPY.successProfileDescription
      : outcome.awaitsApproval
        ? ONBOARDING_COPY.successPendingDescription
        : ONBOARDING_COPY.successDescription

    return (
      <div className={ONBOARDING_STYLES.outcome}>
        <p className={ONBOARDING_STYLES.outcomeTitle}>{ONBOARDING_COPY.successTitle}</p>
        <p className={ONBOARDING_STYLES.lead}>{description}</p>
      </div>
    )
  }

  return (
    <FormWizard
      steps={steps}
      values={values}
      issues={issues}
      onChange={onChange}
      onSubmit={() => void submit()}
      label={ONBOARDING_COPY.progressLabel}
      nextLabel={ONBOARDING_COPY.next}
      previousLabel={ONBOARDING_COPY.previous}
      submitLabel={isSaving ? ONBOARDING_COPY.pending : ONBOARDING_COPY.submit}
      counter={(position, total) => `${position} / ${total}`}
      disabled={isSaving}
      idPrefix="integration"
    />
  )
}
