'use client'

import { useState } from 'react'

import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { DatePicker } from '@/components/elements/forms/date'
import { Field } from '@/components/elements/forms/Field'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { Textarea } from '@/components/elements/forms/Textarea'
import { Drawer } from '@/components/structures/Drawer'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DRAWER_ACTIONS, DRAWER_STYLES, MEMBER_ADMIN } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export type SanctionKind = 'temporary' | 'permanent'

export interface SanctionInput {
  kind: SanctionKind
  until: string
  reason: string
}

export interface SanctionDrawerProps {
  open: boolean
  isSaving: boolean
  onSubmit: (input: SanctionInput) => Promise<boolean>
  onClose: () => void
}

/**
 * Sanction form in a page drawer
 * @param {SanctionDrawerProps} props - State and handlers
 * @return {JSX.Element}
 */

export const SanctionDrawer = ({
  open,
  isSaving,
  onSubmit,
  onClose,
}: SanctionDrawerProps) => {
  const [kind, setKind] = useState<SanctionKind>('temporary')
  const [until, setUntil] = useState('')
  const [reason, setReason] = useState('')

  const SaveIcon = ICONS.confirm
  const CancelIcon = ICONS.close
  const isTemporary = kind === 'temporary'

  // Types on offer
  const options = [
    { value: 'temporary', label: MEMBER_ADMIN_COPY.sanctionTemporary },
    { value: 'permanent', label: MEMBER_ADMIN_COPY.sanctionPermanent },
  ]

  const submit = async () => {
    if (await onSubmit({ kind, until, reason })) onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={MEMBER_ADMIN_COPY.sanctionDrawerTitle}
      icon="sanctions"
      description={MEMBER_ADMIN_COPY.sanctionDrawerLead}
      footer={
        <div className={DRAWER_ACTIONS.stack}>
          <button
            type="button"
            onClick={submit}
            disabled={isSaving || (isTemporary && !until)}
            aria-label={MEMBER_ADMIN_COPY.sanctionSubmit}
            className={cn(DRAWER_ACTIONS.line, DRAWER_ACTIONS.save)}
          >
            {isSaving ? (
              <BrandLoader variant="inline" />
            ) : (
              <SaveIcon className={DRAWER_ACTIONS.icon} aria-hidden="true" />
            )}
            <span className={DRAWER_ACTIONS.lineLabel}>
              {isSaving ? ACTION_COPY.saving : MEMBER_ADMIN_COPY.sanctionSubmit}
            </span>
          </button>
          <span className={DRAWER_ACTIONS.divider} aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label={MEMBER_ADMIN_COPY.sanctionCancel}
            className={cn(DRAWER_ACTIONS.line, DRAWER_ACTIONS.cancel)}
          >
            <CancelIcon className={DRAWER_ACTIONS.icon} aria-hidden="true" />
            <span className={DRAWER_ACTIONS.lineLabel}>{MEMBER_ADMIN_COPY.sanctionCancel}</span>
          </button>
        </div>
      }
    >
      <div className={cn(DRAWER_STYLES.section, MEMBER_ADMIN.form)}>
        <Field
          id="sanction-kind"
          label={MEMBER_ADMIN_COPY.sanctionType}
          hint={isTemporary ? MEMBER_ADMIN_COPY.temporaryLead : MEMBER_ADMIN_COPY.permanentLead}
        >
          <SelectMenu
            id="sanction-kind"
            label={MEMBER_ADMIN_COPY.sanctionType}
            options={options}
            value={kind}
            onChange={(next) => setKind(next as SanctionKind)}
          />
        </Field>

        {isTemporary && (
          <DatePicker
            label={MEMBER_ADMIN_COPY.suspendUntil}
            value={until}
            onChange={(next) => setUntil(typeof next === 'string' ? next : '')}
          />
        )}

        <Field id="sanction-reason" label={MEMBER_ADMIN_COPY.suspendReason}>
          <Textarea
            id="sanction-reason"
            rows={5}
            maxLength={500}
            value={reason}
            placeholder={MEMBER_ADMIN_COPY.reasonPlaceholder}
            onChange={(event) => setReason(event.target.value)}
          />
        </Field>
      </div>
    </Drawer>
  )
}
