'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { AttendanceHoursDialog } from '@/composites/calendar/AttendanceHoursDialog'
import { PresenceUntilDialog } from '@/composites/lives/PresenceUntilDialog'
import { gateState, suggestedUntil } from '@/core/lib/lives/gate'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_GATE } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatHourMark } from '@/utils/format/dates'
import { toDateTimeInput } from '@/utils/format/dates'
import { AttendanceStatuses } from '@/utils/constants/workflow'

/**
 * What the member chose at the gate, sent when the Mod View opens
 * @typedef {Object} PresenceDecision
 * @property {'present' | 'now' | 'revise' | 'passing'} choice - Button picked
 * @property {'PRESENT' | 'ABSENT'} status - Answer sent
 * @property {string | null} from - ISO start, arrival when none
 * @property {string | null} to - ISO end
 */

export interface PresenceDecision {
  choice: 'present' | 'now' | 'revise' | 'passing'
  status: typeof AttendanceStatuses.Present | typeof AttendanceStatuses.Absent
  from: string | null
  to: string | null
}

export interface LivePresenceChoiceProps {
  live: LiveView
  decision: PresenceDecision | null
  onDecide: (decision: PresenceDecision) => void
}

// Choice made once nobody is asked to think about hours
const PASSING: PresenceDecision = {
  choice: 'passing',
  status: AttendanceStatuses.Absent,
  from: null,
  to: null,
}

/**
 * Sentence with its two hours in bold
 * @param {string} template - Wording with {from} and {to}
 * @param {{ from: string, to: string }} hours - ISO hours
 * @return {JSX.Element}
 */

const HoursSentence = ({
  template,
  hours,
}: {
  template: string
  hours: { from: string; to: string }
}) => {
  const [before, rest] = template.split('{from}')
  const [between, after] = rest.split('{to}')

  return (
    <>
      {before}
      <strong>{formatHourMark(hours.from)}</strong>
      {between}
      <strong>{formatHourMark(hours.to)}</strong>
      {after}
    </>
  )
}

/**
 * Presence block of the gate: hours given stand, an early arrival is asked about, anyone else says if they stay
 * @param {LiveView} live - Live
 * @param {PresenceDecision | null} decision - Choice made so far
 * @param {(decision: PresenceDecision) => void} onDecide - Choice handler
 * @return {JSX.Element}
 */

export const LivePresenceChoice = ({ live, decision, onDecide }: LivePresenceChoiceProps) => {
  const [dialog, setDialog] = useState<'until' | 'hours' | null>(null)
  const [state] = useState(() => gateState(live, new Date()))
  const CheckIcon = ICONS.picked
  const FigureIcon = ICONS.members
  const hours = live.myHours

  if (state === 'answered' && hours) {
    // Hours edited here replace the ones given before
    const shown =
      decision?.choice === 'revise' && decision.from && decision.to
        ? { from: decision.from, to: decision.to }
        : hours

    return (
      <div className={LIVE_GATE.answeredBlock}>
        <span className={LIVE_GATE.answeredFigure} aria-hidden="true">
          <FigureIcon className={LIVE_GATE.answeredGlyph} />
          <CheckIcon className={LIVE_GATE.answeredBadge} />
        </span>
        <p className={LIVE_GATE.answered}>
          <HoursSentence template={LIVE_PAGE_COPY.presenceAnswered} hours={shown} />
        </p>
        <Button variant="secondary" onClick={() => setDialog('hours')}>
          {LIVE_PAGE_COPY.presenceEdit}
        </Button>
        {dialog === 'hours' && (
          <AttendanceHoursDialog
            canSkip={false}
            initial={{ from: toDateTimeInput(shown.from), to: toDateTimeInput(shown.to) }}
            onClose={() => setDialog(null)}
            onConfirm={(given) => {
              setDialog(null)
              if (given) {
                onDecide({
                  choice: 'revise',
                  status: AttendanceStatuses.Present,
                  from: given.from,
                  to: given.to,
                })
              }
            }}
          />
        )}
      </div>
    )
  }

  const choices: {
    id: PresenceDecision['choice']
    label: string
    tone: string
    pick: () => void
  }[] =
    state === 'early' && hours
      ? [
          {
            id: 'now',
            label: LIVE_PAGE_COPY.presenceNow,
            tone: LIVE_GATE.choiceSuccess,
            pick: () =>
              onDecide({
                choice: 'now',
                status: AttendanceStatuses.Present,
                from: null,
                to: hours.to,
              }),
          },
          {
            id: 'revise',
            label: LIVE_PAGE_COPY.presenceRevise,
            tone: LIVE_GATE.choiceNeutral,
            pick: () => setDialog('hours'),
          },
          {
            id: 'passing',
            label: LIVE_PAGE_COPY.presencePassingShort,
            tone: LIVE_GATE.choiceDanger,
            pick: () => onDecide(PASSING),
          },
        ]
      : [
          {
            id: 'present',
            label: LIVE_PAGE_COPY.presencePresent,
            tone: LIVE_GATE.choiceSuccess,
            pick: () => setDialog('until'),
          },
          {
            id: 'passing',
            label: LIVE_PAGE_COPY.presencePassing,
            tone: LIVE_GATE.choiceDanger,
            pick: () => onDecide(PASSING),
          },
        ]

  const tag: ReactNode =
    decision?.to && decision.choice === 'present' ? (
      <span className={LIVE_GATE.choiceTag}>
        {LIVE_PAGE_COPY.presenceUntilTag.replace('{to}', formatHourMark(decision.to))}
      </span>
    ) : null

  return (
    <div className={LIVE_GATE.presence}>
      <h3 className={LIVE_GATE.label}>{LIVE_PAGE_COPY.presenceTitle}</h3>
      {state === 'early' && hours && (
        <p className={LIVE_GATE.lead}>
          <HoursSentence template={LIVE_PAGE_COPY.presenceEarly} hours={hours} />
        </p>
      )}
      <div
        className={cn(LIVE_GATE.choices, state === 'early' && LIVE_GATE.choicesStacked)}
        role="radiogroup"
      >
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={decision?.choice === choice.id}
            className={cn(
              LIVE_GATE.choice,
              choice.tone,
              decision?.choice === choice.id && LIVE_GATE.choiceOn,
              decision && decision.choice !== choice.id && LIVE_GATE.choiceMuted
            )}
            onClick={choice.pick}
          >
            {choice.label}
            {decision?.choice === choice.id && tag}
          </button>
        ))}
      </div>

      {dialog === 'until' && (
        <PresenceUntilDialog
          initial={toDateTimeInput(
            suggestedUntil(
              new Date(),
              live.plannedEndAt ? new Date(live.plannedEndAt) : null,
              LIVE_SETTINGS.presenceSuggestHours
            )
          )}
          onClose={() => setDialog(null)}
          onConfirm={(to) => {
            setDialog(null)
            onDecide({ choice: 'present', status: AttendanceStatuses.Present, from: null, to })
          }}
        />
      )}

      {dialog === 'hours' && hours && (
        <AttendanceHoursDialog
          canSkip={false}
          initial={{ from: toDateTimeInput(new Date()), to: toDateTimeInput(hours.to) }}
          onClose={() => setDialog(null)}
          onConfirm={(given) => {
            setDialog(null)
            if (given) {
              onDecide({
                choice: 'revise',
                status: AttendanceStatuses.Present,
                from: given.from,
                to: given.to,
              })
            }
          }}
        />
      )}
    </div>
  )
}
