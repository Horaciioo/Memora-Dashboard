'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { Section } from '@/components/structures/Section'
import { TwoFactorPanel } from '@/composites/security/TwoFactorPanel'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { SECURITY_LIST, TWO_FACTOR_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import { cn } from '@/utils/classnames'
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

  const StatusGlyph = ICONS[state.isEnrolled ? 'shield' : 'twoFactor']

  return (
    <Section title={TWO_FACTOR_COPY.title} padded>
      <ul className={SECURITY_LIST.list}>
        <li className={SECURITY_LIST.row}>
          <ICONS.twoFactor className={SECURITY_LIST.glyph} />
          <div className={SECURITY_LIST.body}>
            <p className={SECURITY_LIST.title}>{TWO_FACTOR_COPY.title}</p>
            <p className={SECURITY_LIST.meta}>{TWO_FACTOR_COPY.lead}</p>
          </div>
          <span
            className={cn(
              SECURITY_LIST.status,
              state.isEnrolled ? SECURITY_LIST.on : SECURITY_LIST.off
            )}
          >
            <StatusGlyph className={SECURITY_LIST.statusGlyph} />
            {state.isEnrolled ? TWO_FACTOR_COPY.enrolled : TWO_FACTOR_COPY.notEnrolled}
          </span>
        </li>

        {state.isEnrolled && (
          <li className={SECURITY_LIST.row}>
            <ICONS.key className={SECURITY_LIST.glyph} />
            <div className={SECURITY_LIST.body}>
              <p className={SECURITY_LIST.title}>{TWO_FACTOR_COPY.recoveryTitle}</p>
              <p className={SECURITY_LIST.meta}>{`${codesLeft} ${codesLabel}`}</p>
            </div>
          </li>
        )}

        {state.isEnrolled && (
          <li className={SECURITY_LIST.row}>
            {seal.isUnsealed ? (
              <ICONS.unlock className={SECURITY_LIST.glyph} />
            ) : (
              <ICONS.lock className={SECURITY_LIST.glyph} />
            )}
            <div className={SECURITY_LIST.body}>
              <p className={SECURITY_LIST.title}>{TWO_FACTOR_COPY.unlockTitle}</p>
              <p className={SECURITY_LIST.meta}>
                {seal.isUnsealed && seal.closesAt
                  ? `${TWO_FACTOR_COPY.unlockedUntil} ${formatDayTime(seal.closesAt)}`
                  : TWO_FACTOR_COPY.sealedHint}
              </p>
            </div>
          </li>
        )}
      </ul>

      <div className={SECURITY_LIST.footer}>
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
