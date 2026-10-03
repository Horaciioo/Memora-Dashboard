'use client'

import { useState, type CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Textarea } from '@/components/elements/forms/Textarea'
import { AbsenceCalendar, type AbsenceSpan } from '@/composites/absences/AbsenceCalendar'
import { ABSENCE_COPY, ABSENCE_FIELD_COPY } from '@/declarations/absences/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { ICONS } from '@/declarations/ui/icons'
import { ABSENCE_WIZARD } from '@/declarations/ui/variants'
import type { FieldIssue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { absenceSentence } from '@/utils/format/absences'
import { countDays } from '@/utils/format/dates'

// Steps of a declaration, in order, with where each sits along the height of its box: near the
// top, the middle and near the bottom, never touching the borders
const STEPS = [
  { number: 1, label: ABSENCE_COPY.stepPeriod, top: 11 },
  { number: 2, label: ABSENCE_COPY.stepReason, top: 50 },
  { number: 3, label: ABSENCE_COPY.stepDone, top: 89 },
] as const

// Half the height of a chip, the dashed run starts and stops beyond it
const CHIP_REACH = '1.25rem'

export interface AbsenceWizardProps {
  booked: AbsenceSpan[]
  // Days an absence must exceed to be declared
  thresholdDays: number
  isSaving: boolean
  issues: FieldIssue[]
  onSubmit: (values: FormValues) => Promise<boolean>
  onEdit: () => void
  onClose: () => void
}

/**
 * Declaring an absence in three steps drawn as a vertical timeline: the period on the calendar,
 * a reason if wanted, then the thanks. The page stays where it is, the last step is closed by hand
 * @param {AbsenceWizardProps} props - Absences in the way, limits and the send handler
 * @return {JSX.Element}
 */

export const AbsenceWizard = ({
  booked,
  thresholdDays,
  isSaving,
  issues,
  onSubmit,
  onEdit,
  onClose,
}: AbsenceWizardProps) => {
  const [step, setStep] = useState(1)
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [sentReason, setSentReason] = useState<string | null>(null)

  const Success = ICONS.success
  const Tick = ICONS.picked

  const days = start && end ? countDays(start, end) : 0
  const isShort = Boolean(start && end) && days <= thresholdDays
  const rejection = issues.find((issue) => issue.field === 'dates')?.message
  const canContinue = Boolean(start && end) && !isShort

  const send = async () => {
    if (!start || !end) return

    if (await onSubmit({ dates: [start, end], reason })) {
      setSentReason(reason.trim() || null)
      setStep(3)
    }
  }

  const current = STEPS[Math.min(step, STEPS.length) - 1]!

  return (
    <section className={ABSENCE_WIZARD.root}>
      <ol className={ABSENCE_WIZARD.timeline} aria-label={ABSENCE_COPY.timeline}>
        {STEPS.slice(0, -1).map((item, index) => (
          <li
            key={`rail-${item.number}`}
            role="presentation"
            aria-hidden="true"
            className={cn(
              ABSENCE_WIZARD.rail,
              (step > item.number || step === 3) && ABSENCE_WIZARD.railDone
            )}
            style={{
              top: `calc(${item.top}% + ${CHIP_REACH})`,
              height: `calc(${STEPS[index + 1]!.top - item.top}% - ${CHIP_REACH} * 2)`,
            }}
          />
        ))}
        {STEPS.map((item) => {
          const isDone = step > item.number || step === 3
          const isCurrent = step === item.number && step !== 3

          return (
            <li
              key={item.number}
              className={ABSENCE_WIZARD.step}
              style={{ '--step-top': `${item.top}%` } as CSSProperties}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  ABSENCE_WIZARD.chip,
                  isDone
                    ? ABSENCE_WIZARD.chipDone
                    : isCurrent
                      ? ABSENCE_WIZARD.chipCurrent
                      : ABSENCE_WIZARD.chipTodo
                )}
              >
                {isDone ? (
                  <Tick className={ABSENCE_WIZARD.chipGlyph} aria-hidden="true" />
                ) : (
                  item.number
                )}
              </span>
              <span className="sr-only">{item.label}</span>
            </li>
          )
        })}
      </ol>

      <div className={ABSENCE_WIZARD.stageBox}>
        <span
          className={ABSENCE_WIZARD.tail}
          style={{ top: `${current.top}%` }}
          aria-hidden="true"
        />
        <div key={step} className={ABSENCE_WIZARD.stage}>
          {step === 1 && (
            <>
              <div>
                <h2 className={ABSENCE_WIZARD.stageTitle}>{ABSENCE_COPY.stepPeriod}</h2>
                <p className={ABSENCE_WIZARD.hint}>{ABSENCE_COPY.stepPeriodHint}</p>
              </div>
              <AbsenceCalendar
                start={start}
                end={end}
                booked={booked}
                onChange={(nextStart, nextEnd) => {
                  onEdit()
                  setStart(nextStart)
                  setEnd(nextEnd)
                }}
              />
              <div className={ABSENCE_WIZARD.summary} aria-live="polite">
                {start && end && (
                  <>
                    <p className={ABSENCE_WIZARD.sentence}>{absenceSentence(start, end)}</p>
                    <p className={ABSENCE_WIZARD.duration}>
                      {days === 1
                        ? ABSENCE_COPY.durationOne
                        : ABSENCE_COPY.duration.replace('{days}', String(days))}
                    </p>
                    {(isShort || rejection) && (
                      <p className={ABSENCE_WIZARD.warning}>
                        {isShort
                          ? ABSENCE_COPY.tooShort.replace('{min}', String(thresholdDays + 1))
                          : rejection}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className={ABSENCE_WIZARD.actions}>
                <Button variant="primary" disabled={!canContinue} onClick={() => setStep(2)}>
                  {ABSENCE_COPY.next}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  {ABSENCE_COPY.cancelDeclaration}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className={ABSENCE_WIZARD.stageTitle}>{ABSENCE_COPY.stepReason}</h2>
              <div>
                <label htmlFor="absence-reason" className="sr-only">
                  {ABSENCE_FIELD_COPY.reason}
                </label>
                <Textarea
                  id="absence-reason"
                  rows={6}
                  value={reason}
                  maxLength={FORM_SETTINGS.shortTextMaxLength}
                  className={ABSENCE_WIZARD.placeholder}
                  placeholder={ABSENCE_COPY.reasonPlaceholder}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
              <div className={ABSENCE_WIZARD.actions}>
                <Button variant="primary" isLoading={isSaving} onClick={send}>
                  {ABSENCE_COPY.send}
                </Button>
                <Button variant="ghost" disabled={isSaving} onClick={() => setStep(1)}>
                  {ABSENCE_COPY.back}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className={ABSENCE_WIZARD.success} aria-live="polite">
              <Success className={ABSENCE_WIZARD.successGlyph} aria-hidden="true" />
              <h2 className={ABSENCE_WIZARD.thanks}>{ABSENCE_COPY.thanks}</h2>
              {sentReason && (
                <div className={ABSENCE_WIZARD.reasonBlock}>
                  <p className={ABSENCE_WIZARD.reasonLabel}>{ABSENCE_COPY.reasonLabel}</p>
                  <p className={ABSENCE_WIZARD.reasonBox}>{sentReason}</p>
                </div>
              )}
              <Button variant="primary" onClick={onClose}>
                {ABSENCE_COPY.finish}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
