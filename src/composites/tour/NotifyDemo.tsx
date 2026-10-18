'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { MemoraMark } from '@/components/elements/display/marks/MemoraMark'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFY_DEMO } from '@/declarations/tour/deck'
import { TOUR_DECK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Someone tries to notify a member in absence on a task, and Memora says no
 * @return {JSX.Element}
 */

export const NotifyDemo = () => {
  const [beat, setBeat] = useState(1)

  // One beat after the other
  useEffect(() => {
    if (beat >= TOUR_SETTINGS.demoBeats) return

    const timer = window.setTimeout(
      () => setBeat((current) => current + 1),
      TOUR_SETTINGS.demoStepMs
    )

    return () => window.clearTimeout(timer)
  }, [beat])

  const isRefused = beat >= TOUR_SETTINGS.demoBeats

  return (
    <div className={TOUR_DECK.demo} aria-live="polite">
      <p className={TOUR_DECK.demoProject}>{NOTIFY_DEMO.project}</p>
      <p className={TOUR_DECK.demoTask}>{NOTIFY_DEMO.task}</p>
      <p className={TOUR_DECK.demoLabel}>{NOTIFY_DEMO.assignLabel}</p>

      {NOTIFY_DEMO.members.map((member) => (
        <div
          key={member.name}
          className={cn(TOUR_DECK.demoRow, member.isAbsent && TOUR_DECK.demoRowAbsent)}
        >
          <Avatar name={member.name} size="sm" />
          <span className={TOUR_DECK.demoName}>
            {member.name}
            {member.isAbsent && (
              <span className={TOUR_DECK.demoAbsent}>{NOTIFY_DEMO.absentTag}</span>
            )}
          </span>
          <Button
            variant={member.isAbsent && beat >= 2 ? 'ghost' : 'secondary'}
            disabled={member.isAbsent && isRefused}
            className={TOUR_DECK.demoButton}
          >
            {NOTIFY_DEMO.notify}
          </Button>
        </div>
      ))}

      {isRefused && (
        <p className={TOUR_DECK.demoRefusal} role="status">
          <MemoraMark className={TOUR_DECK.demoMark} />
          {NOTIFY_DEMO.refusal}
        </p>
      )}
    </div>
  )
}
