'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { MODVIEW_POLL_COPY } from '@/declarations/modview/copy'
import { POLL_DEFAULT_MINUTES, POLL_DURATIONS, POLL_LIMITS } from '@/declarations/modview/polls'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_POLL } from '@/declarations/ui/variants'
import type { ModViewIntent } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { MINUTE_SECONDS } from '@/utils/constants/time'

export interface PollDialogProps {
  onStart: (intent: Extract<ModViewIntent, { kind: 'poll' }>) => void
  onClose: () => void
}

/**
 * Centred form opened by /poll
 * @param {(intent) => void} onStart - Launch handler
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const PollDialog = ({ onStart, onClose }: PollDialogProps) => {
  const [title, setTitle] = useState('')
  const [choices, setChoices] = useState<string[]>(
    Array.from({ length: POLL_LIMITS.minChoices }, () => '')
  )
  const [minutes, setMinutes] = useState(POLL_DEFAULT_MINUTES)
  const [hasPoints, setHasPoints] = useState(false)
  const [points, setPoints] = useState<number>(POLL_LIMITS.defaultPoints)
  const CloseIcon = ICONS.close

  const filled = choices.map((choice) => choice.trim()).filter(Boolean)
  const canStart = title.trim() !== '' && filled.length >= POLL_LIMITS.minChoices

  const start = () => {
    if (!canStart) return
    onStart({
      kind: 'poll',
      title: title.trim(),
      choices: filled,
      seconds: minutes * MINUTE_SECONDS,
      ...(hasPoints ? { points } : {}),
    })
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={MODVIEW_POLL_COPY.createTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {MODVIEW_POLL_COPY.cancel}
          </Button>
          <Button variant="primary" disabled={!canStart} onClick={start}>
            {MODVIEW_POLL_COPY.start}
          </Button>
        </>
      }
    >
      <div className={MODVIEW_POLL.form}>
        <label className={MODVIEW_POLL.field}>
          <span className={MODVIEW_POLL.label}>{MODVIEW_POLL_COPY.question}</span>
          <Input
            autoFocus
            value={title}
            maxLength={POLL_LIMITS.titleLength}
            placeholder={MODVIEW_POLL_COPY.questionPlaceholder}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <div className={MODVIEW_POLL.field}>
          <span className={MODVIEW_POLL.label}>{MODVIEW_POLL_COPY.choices}</span>
          {choices.map((choice, index) => (
            <div key={index} className={MODVIEW_POLL.choiceRow}>
              <Input
                value={choice}
                maxLength={POLL_LIMITS.choiceLength}
                aria-label={MODVIEW_POLL_COPY.choice.replace('{rank}', String(index + 1))}
                placeholder={MODVIEW_POLL_COPY.choice.replace('{rank}', String(index + 1))}
                onChange={(event) =>
                  setChoices(choices.map((old, at) => (at === index ? event.target.value : old)))
                }
              />
              {choices.length > POLL_LIMITS.minChoices && (
                <button
                  type="button"
                  className={MODVIEW_POLL.fold}
                  aria-label={MODVIEW_POLL_COPY.removeChoice}
                  title={MODVIEW_POLL_COPY.removeChoice}
                  onClick={() => setChoices(choices.filter((_, at) => at !== index))}
                >
                  <CloseIcon className={MODVIEW_POLL.foldIcon} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          {choices.length < POLL_LIMITS.maxChoices && (
            <button
              type="button"
              className={MODVIEW_POLL.addChoice}
              onClick={() => setChoices([...choices, ''])}
            >
              {MODVIEW_POLL_COPY.addChoice}
            </button>
          )}
        </div>

        <div className={MODVIEW_POLL.field}>
          <span className={MODVIEW_POLL.label}>{MODVIEW_POLL_COPY.duration}</span>
          <div className={MODVIEW_POLL.durations}>
            {POLL_DURATIONS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={value === minutes}
                className={cn(
                  MODVIEW_POLL.duration,
                  value === minutes ? MODVIEW_POLL.durationOn : MODVIEW_POLL.durationOff
                )}
                onClick={() => setMinutes(value)}
              >
                {MODVIEW_POLL_COPY.minutes.replace('{count}', String(value))}
              </button>
            ))}
          </div>
        </div>

        <div className={MODVIEW_POLL.pointsRow}>
          <span className={MODVIEW_POLL.pointsLabel}>{MODVIEW_POLL_COPY.points}</span>
          <Toggle
            bare
            checked={hasPoints}
            label={MODVIEW_POLL_COPY.points}
            onChange={setHasPoints}
          />
        </div>
        {hasPoints && (
          <label className={MODVIEW_POLL.field}>
            <span className={MODVIEW_POLL.label}>{MODVIEW_POLL_COPY.pointsCost}</span>
            <Input
              type="number"
              min={POLL_LIMITS.minPoints}
              max={POLL_LIMITS.maxPoints}
              value={points}
              onChange={(event) => setPoints(Number(event.target.value))}
            />
          </label>
        )}
      </div>
    </Dialog>
  )
}
