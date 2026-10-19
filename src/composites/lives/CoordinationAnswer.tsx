'use client'

import { DatePicker } from '@/components/elements/forms/date/DatePicker'
import type { CoordinationWindow } from '@/core/hooks/data/lives/useCoordinationReply'
import { LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_COORDINATION } from '@/declarations/ui/variants'
import type { CoordinationRequest } from '@/types/lives'
import { formatClock, formatDay } from '@/utils/format/dates'

export interface CoordinationAnswerProps {
  request: CoordinationRequest
  window: CoordinationWindow
  onChange: (window: CoordinationWindow) => void
}

/**
 * Facts of one request to coordinate and the two hours offered, the answer sits in the footer
 * @param {CoordinationRequest} request - Live asking
 * @param {CoordinationWindow} window - Hours offered
 * @param {(window: CoordinationWindow) => void} onChange - Hours edited
 * @return {JSX.Element}
 */

export const CoordinationAnswer = ({ request, window, onChange }: CoordinationAnswerProps) => {
  const facts = [
    { icon: 'stream', text: request.title },
    { icon: 'meetings', text: formatDay(request.startsAt) },
    {
      icon: 'clock',
      text: request.endsAt
        ? `${formatClock(request.startsAt)} → ${formatClock(request.endsAt)}`
        : formatClock(request.startsAt),
    },
  ] as const

  return (
    <div className={LIVE_COORDINATION.answer}>
      <section className={LIVE_COORDINATION.infosGroup}>
        <h3 className={LIVE_COORDINATION.infos}>{LIVE_COORDINATION_COPY.infos}</h3>
        <ul className={LIVE_COORDINATION.facts}>
          {facts.map((fact) => {
            const Glyph = ICONS[fact.icon]

            return (
              <li key={fact.icon} className={LIVE_COORDINATION.fact}>
                <Glyph className={LIVE_COORDINATION.factGlyph} aria-hidden="true" />
                {fact.text}
              </li>
            )
          })}
        </ul>
      </section>

      <div className={LIVE_COORDINATION.times}>
        {(
          [
            { key: 'from', label: LIVE_COORDINATION_COPY.from },
            { key: 'to', label: LIVE_COORDINATION_COPY.to },
          ] as const
        ).map((field) => (
          <div key={field.key} className={LIVE_COORDINATION.timeField}>
            <span className={LIVE_COORDINATION.timeLabel}>{field.label}</span>
            <DatePicker
              label={field.label}
              withTime
              value={window[field.key]}
              onChange={(next) =>
                onChange({ ...window, [field.key]: typeof next === 'string' ? next : '' })
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
