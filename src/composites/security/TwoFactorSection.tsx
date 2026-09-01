'use client'

import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { Section } from '@/components/structures/Section'
import { TwoFactorPanel } from '@/composites/security/TwoFactorPanel'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { SEAL_BLOCK, TWO_FACTOR_BLOCK } from '@/declarations/ui/blocks'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import { formatDayTime } from '@/utils/format/dates'

/**
 * Second factor settings
 * @return {JSX.Element}
 */

export const TwoFactorSection = () => {
  const { factor } = useSeal()
  const [pane, setPane] = useState<'enrol' | 'drop' | null>(null)
  const [code, setCode] = useState('')

  const { state, seal } = factor
  const codesLeft = state.recoveryCodesLeft
  const codesLabel =
    codesLeft === 1 ? TWO_FACTOR_COPY.recoveryLeftOne : TWO_FACTOR_COPY.recoveryLeft

  const close = () => {
    factor.dismiss()
    setCode('')
    setPane(null)
  }

  return (
    <Section
      title={TWO_FACTOR_COPY.title}
      description={TWO_FACTOR_COPY.lead}
      action={
        <Badge
          label={state.isEnrolled ? TWO_FACTOR_COPY.enrolled : TWO_FACTOR_COPY.notEnrolled}
          tone={state.isEnrolled ? 'success' : 'neutral'}
          icon={state.isEnrolled ? 'lock' : 'unlock'}
        />
      }
      padded
    >
      <div className={PREFERENCE_STYLES.rows}>
        {state.isEnrolled && (
          <>
            <div className={PREFERENCE_STYLES.row}>
              <span className={PREFERENCE_STYLES.label}>{TWO_FACTOR_COPY.recoveryTitle}</span>
              <span className={PREFERENCE_STYLES.notice}>{`${codesLeft} ${codesLabel}`}</span>
            </div>
            <div className={PREFERENCE_STYLES.row}>
              <span className={PREFERENCE_STYLES.label}>{TWO_FACTOR_COPY.unlockTitle}</span>
              {seal.isUnsealed && seal.closesAt ? (
                <span className={SEAL_BLOCK.window}>
                  {`${TWO_FACTOR_COPY.unlockedUntil} ${formatDayTime(seal.closesAt)}`}
                </span>
              ) : (
                <span className={PREFERENCE_STYLES.notice}>{TWO_FACTOR_COPY.sealedHint}</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className={PREFERENCE_STYLES.footer}>
        {state.isEnrolled ? (
          <>
            {seal.isUnsealed && (
              <Button icon="lock" disabled={factor.isSaving} onClick={() => void factor.reseal()}>
                {TWO_FACTOR_COPY.seal}
              </Button>
            )}
            <Button variant="danger" icon="remove" onClick={() => setPane('drop')}>
              {TWO_FACTOR_COPY.drop}
            </Button>
          </>
        ) : (
          <Button variant="primary" icon="key" onClick={() => setPane('enrol')}>
            {TWO_FACTOR_COPY.enrol}
          </Button>
        )}
      </div>

      <Dialog
        open={pane === 'enrol'}
        onClose={close}
        size="md"
        title={TWO_FACTOR_COPY.enrolTitle}
        description={TWO_FACTOR_COPY.enrolLead}
      >
        <TwoFactorPanel mode="enrol" onDone={close} />
      </Dialog>

      <Dialog
        open={pane === 'drop'}
        onClose={close}
        size="xs"
        title={TWO_FACTOR_COPY.dropTitle}
        description={TWO_FACTOR_COPY.dropLead}
        footer={
          <Button
            variant="danger"
            icon="remove"
            disabled={factor.isSaving || code.length === 0}
            onClick={async () => {
              if (await factor.drop(code)) close()
            }}
          >
            {TWO_FACTOR_COPY.drop}
          </Button>
        }
      >
        <label className={TWO_FACTOR_BLOCK.field}>
          <span className={PREFERENCE_STYLES.label}>{TWO_FACTOR_COPY.codeLabel}</span>
          <input
            value={code}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={TWO_FACTOR_COPY.codePlaceholder}
            disabled={factor.isSaving}
            onChange={(event) => setCode(event.target.value.trim())}
            className={TWO_FACTOR_BLOCK.digits}
          />
        </label>
      </Dialog>
    </Section>
  )
}
