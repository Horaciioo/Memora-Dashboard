'use client'

import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { UNBAN_DECISION_FIELDS, UNBAN_REOPEN_FIELDS } from '@/declarations/unban/fields'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { FieldIssue, FormValues } from '@/types/forms'

export type DecisionKind = 'accept' | 'refuse' | 'reopen'

// Words only, the counter and the outcome are added by the caller
const DECISION_FIELDS = UNBAN_DECISION_FIELDS.filter((field) => field.name === 'reviewNote')
const REOPEN_FIELDS = UNBAN_REOPEN_FIELDS.filter((field) => field.name === 'reason')

const TITLES: Record<DecisionKind, string> = {
  accept: UNBAN_SCREEN_COPY.acceptTitle,
  refuse: UNBAN_SCREEN_COPY.refuseTitle,
  reopen: UNBAN_SCREEN_COPY.reopenTitle,
}

export interface DecisionDrawerProps {
  kind: DecisionKind | null
  isSaving: boolean
  issues: FieldIssue[]
  onSubmit: (values: FormValues) => Promise<boolean>
  onClose: () => void
}

/**
 * Drawer asking for the answer to the requester or the reason of a reopening
 * @param {DecisionDrawerProps} props - Decision asked for and its handlers
 * @return {JSX.Element}
 */

export const DecisionDrawer = ({
  kind,
  isSaving,
  issues,
  onSubmit,
  onClose,
}: DecisionDrawerProps) => (
  <FormDrawer
    open={kind !== null}
    title={TITLES[kind ?? 'accept']}
    subject={FORM_SUBJECTS.unbanDecision}
    fields={kind === 'reopen' ? REOPEN_FIELDS : DECISION_FIELDS}
    issues={issues}
    isSaving={isSaving}
    onSubmit={onSubmit}
    onClose={onClose}
  />
)
