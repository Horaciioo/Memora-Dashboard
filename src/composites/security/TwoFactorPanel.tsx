'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { TWO_FACTOR_SETTINGS } from '@/declarations/configurations/settings'
import { TWO_FACTOR_BLOCK } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface TwoFactorPanelProps {
  mode: 'enrol' | 'unlock'
  onDone?: () => void
}

/**
 * Second factor form
 * @param {'enrol' | 'unlock'} mode - Whether a factor is being posed or spent
 * @param {() => void} [onDone] - Called once the code lands
 * @return {JSX.Element}
 */

export const TwoFactorPanel = ({ mode, onDone }: TwoFactorPanelProps) => {
  const { factor } = useSeal()
  const [code, setCode] = useState('')

  const { enrolment } = factor
  const issue = factor.issues.find((entry) => entry.field === 'code')
  const isEnrolling = mode === 'enrol' || !factor.state.isEnrolled

  const submit = async () => {
    const landed = isEnrolling ? await factor.confirm(code) : await factor.unseal(code)
    if (!landed) return

    setCode('')
    onDone?.()
  }

  // Nothing to type against until an enrolment has been opened
  if (isEnrolling && !enrolment) {
    return (
      <EmptyState
        figure="settings"
        variant="start"
        title={TWO_FACTOR_COPY.missingTitle}
        description={TWO_FACTOR_COPY.missingLead}
        action={
          <Button
            variant="primary"
            icon="key"
            disabled={factor.isSaving}
            onClick={() => void factor.enrol()}
          >
            {factor.isSaving ? ACTION_COPY.saving : TWO_FACTOR_COPY.enrol}
          </Button>
        }
      />
    )
  }

  return (
    <div className={TWO_FACTOR_BLOCK.panel}>
      {enrolment && (
        <div className={TWO_FACTOR_BLOCK.layout}>
          <div
            className={TWO_FACTOR_BLOCK.qr}
            // The QR is an inline SVG built server-side from the otpauth URI
            dangerouslySetInnerHTML={{ __html: enrolment.qrCode }}
          />
          <div className={TWO_FACTOR_BLOCK.aside}>
            <p className={TWO_FACTOR_BLOCK.lead}>{TWO_FACTOR_COPY.enrolLead}</p>
            <p className={TWO_FACTOR_BLOCK.heading}>{TWO_FACTOR_COPY.manualTitle}</p>
            <p className={TWO_FACTOR_BLOCK.secret}>
              <span>{enrolment.secret}</span>
              <Button
                variant="icon"
                icon="copy"
                aria-label={TWO_FACTOR_COPY.copySecret}
                title={TWO_FACTOR_COPY.copySecret}
                onClick={() => void navigator.clipboard.writeText(enrolment.secret)}
              />
            </p>

            <p className={TWO_FACTOR_BLOCK.heading}>{TWO_FACTOR_COPY.recoveryTitle}</p>
            <p className={TWO_FACTOR_BLOCK.note}>{TWO_FACTOR_COPY.recoveryLead}</p>
            <div className={TWO_FACTOR_BLOCK.codes}>
              {enrolment.recoveryCodes.map((entry) => (
                <span key={entry} className={TWO_FACTOR_BLOCK.code}>
                  {entry}
                </span>
              ))}
            </div>
            <Button
              icon="copy"
              onClick={() => void navigator.clipboard.writeText(enrolment.recoveryCodes.join('\n'))}
            >
              {TWO_FACTOR_COPY.copyRecovery}
            </Button>
          </div>
        </div>
      )}

      <label className={TWO_FACTOR_BLOCK.field}>
        <span className={TWO_FACTOR_BLOCK.fieldLabel}>{TWO_FACTOR_COPY.codeLabel}</span>
        <input
          value={code}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={TWO_FACTOR_SETTINGS.recoveryCodeBytes * 2}
          placeholder={TWO_FACTOR_COPY.codePlaceholder}
          disabled={factor.isSaving}
          onChange={(event) => setCode(event.target.value.trim())}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submit()
          }}
          className={cn(TWO_FACTOR_BLOCK.digits, issue && FIELD_STYLES.invalid)}
        />
        {issue && <span className={TWO_FACTOR_BLOCK.error}>{issue.message}</span>}
      </label>

      <div className={TWO_FACTOR_BLOCK.footer}>
        <Button
          variant="primary"
          icon="unlock"
          disabled={factor.isSaving || code.length === 0}
          onClick={() => void submit()}
        >
          {factor.isSaving
            ? ACTION_COPY.saving
            : isEnrolling
              ? TWO_FACTOR_COPY.confirm
              : TWO_FACTOR_COPY.unlock}
        </Button>
      </div>
    </div>
  )
}
