'use client'

import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { Drawer } from '@/components/structures/Drawer'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TASK_STEPPER } from '@/declarations/ui/variants'
import type { HomeEntry } from '@/types/personal'
import { cn } from '@/utils/classnames'

export interface HomeTaskStepperProps {
  entries: HomeEntry[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
  // Hidden while a form takes over
  hidden?: boolean
}

/**
 * Tasks walked one after another
 * @param {HomeEntry[]} entries - Queue in order
 * @param {number} index - Task on screen
 * @param {(index: number) => void} onIndex - Moves along the queue
 * @param {() => void} onClose - Dismiss handler
 * @param {boolean} [hidden] - Steps aside for a form
 * @return {JSX.Element | null}
 */

export const HomeTaskStepper = ({
  entries,
  index,
  onIndex,
  onClose,
  hidden,
}: HomeTaskStepperProps) => {
  // A treated task leaves, the next one slides in
  const current = entries[Math.min(index, entries.length - 1)]
  const position = Math.min(index, entries.length - 1)
  const Glyph = ICONS[current?.icon ?? 'waiting']

  if (!current) return null

  return (
    <Drawer
      open={!hidden}
      onClose={onClose}
      title={PERSONAL_TASK_COPY.stepperLabel}
      icon="tasks"
      subheader={PERSONAL_TASK_COPY.stepCounter
        .replace('{index}', String(position + 1))
        .replace('{total}', String(entries.length))}
      footer={
        <div className={TASK_STEPPER.footer}>
          <div className={TASK_STEPPER.actions}>
            {current.actions.map((action) =>
              action.href ? (
                <Link key={action.id} href={action.href}>
                  <Button variant={action.variant}>{action.label}</Button>
                </Link>
              ) : (
                <Button key={action.id} variant={action.variant} onClick={action.onSelect}>
                  {action.label}
                </Button>
              )
            )}
          </div>
          <div className={TASK_STEPPER.nav}>
            <Button
              variant="ghost"
              icon="back"
              disabled={position === 0}
              onClick={() => onIndex(position - 1)}
            >
              {PERSONAL_TASK_COPY.previous}
            </Button>
            <Button
              variant="ghost"
              iconAfter="next"
              disabled={position === entries.length - 1}
              onClick={() => onIndex(position + 1)}
            >
              {PERSONAL_TASK_COPY.next}
            </Button>
          </div>
        </div>
      }
    >
      <div key={current.key} className={cn(TASK_STEPPER.body, 'drawer-section-enter')}>
        <div className={TASK_STEPPER.hero}>
          <Glyph className={TASK_STEPPER.heroGlyph} aria-hidden="true" />
          <h3 className={TASK_STEPPER.heroTitle}>{current.title}</h3>
          {current.meta && <p className={TASK_STEPPER.heroMeta}>{current.meta}</p>}
          {current.due && <span className={TASK_STEPPER.heroDue}>{current.due}</span>}
        </div>

        {current.detail}

        <div className={TASK_STEPPER.dots} aria-hidden="true">
          {entries.map((entry, dotIndex) => (
            <span
              key={entry.key}
              className={cn(TASK_STEPPER.dot, dotIndex === position && TASK_STEPPER.dotActive)}
            />
          ))}
        </div>
      </div>
    </Drawer>
  )
}
