'use client'

import Link from '@/components/elements/navigation/AppLink'

import { Fragment } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { STEPPER_VISIBLE_STEPS, TASK_GROUPS } from '@/declarations/personal/groups'
import { ICONS } from '@/declarations/ui/icons'
import { DRAWER_ACTIONS, TASK_STEPPER } from '@/declarations/ui/variants'
import type { HomeEntry } from '@/types/personal'
import { cn } from '@/utils/classnames'

// Footer line each button variant draws as
const LINE_OF_VARIANT = { primary: 'save', danger: 'cancel', secondary: 'neutral' } as const

export interface HomeTaskStepperProps {
  // Kind of task being walked
  group: string
  entries: HomeEntry[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
  // Hidden while a form takes over
  hidden?: boolean
}

/**
 * Tasks walked one after another
 * @param {string} group - Kind of task walked
 * @param {HomeEntry[]} entries - The group in order
 * @param {number} index - Task on screen
 * @param {(index: number) => void} onIndex - Moves along the queue
 * @param {() => void} onClose - Dismiss handler
 * @param {boolean} [hidden] - Steps aside for a form
 * @return {JSX.Element | null}
 */

export const HomeTaskStepper = ({
  group,
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

  const isSolo = Boolean(TASK_GROUPS[group]?.solo)

  // Window of steps around the one on screen
  const first = Math.max(
    0,
    Math.min(
      position - Math.floor(STEPPER_VISIBLE_STEPS / 2),
      entries.length - STEPPER_VISIBLE_STEPS
    )
  )
  const steps = entries.slice(first, first + STEPPER_VISIBLE_STEPS)

  return (
    <Drawer
      open={!hidden}
      onClose={onClose}
      title={TASK_GROUPS[group]?.title ?? PERSONAL_TASK_COPY.stepperLabel}
      icon={TASK_GROUPS[group]?.icon ?? 'tasks'}
      subheader={
        !isSolo ? (
          <p className={TASK_STEPPER.counter}>
            {PERSONAL_TASK_COPY.stepCounter
              .replace('{index}', String(position + 1))
              .replace('{total}', String(entries.length))}
          </p>
        ) : undefined
      }
      footer={
        <div className={TASK_STEPPER.footer}>
          <div className={TASK_STEPPER.lines}>
            {current.actions.map((action, actionIndex) => {
              const tone = action.line ?? LINE_OF_VARIANT[action.variant]
              const content = <span className={DRAWER_ACTIONS.lineLabelPlain}>{action.label}</span>
              const className = cn(
                DRAWER_ACTIONS.line,
                DRAWER_ACTIONS[tone],
                DRAWER_ACTIONS.linePlain
              )

              return (
                <Fragment key={action.id}>
                  {actionIndex > 0 && (
                    <span className={DRAWER_ACTIONS.divider} aria-hidden="true" />
                  )}
                  {action.href ? (
                    <Link href={action.href} aria-label={action.label} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-label={action.label}
                      className={className}
                      onClick={action.onSelect}
                    >
                      {content}
                    </button>
                  )}
                </Fragment>
              )
            })}
          </div>
          {!isSolo && (
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
          )}
        </div>
      }
    >
      <div key={current.key} className={cn(TASK_STEPPER.body, 'drawer-section-enter')}>
        <div className={cn(TASK_STEPPER.hero, current.hero && TASK_STEPPER.heroMedia)}>
          {current.hero?.backdrop && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.hero.backdrop} alt="" className={TASK_STEPPER.heroBackdrop} />
          )}
          {current.hero ? (
            <Avatar
              name={current.hero.name}
              src={current.hero.avatar}
              size="xl"
              className={TASK_STEPPER.heroPortrait}
            />
          ) : (
            <Glyph className={TASK_STEPPER.heroGlyph} aria-hidden="true" />
          )}
          <h3 className={TASK_STEPPER.heroTitle}>
            {current.hero?.title ?? current.heroTitle ?? current.title}
          </h3>
          {!current.hero && !current.heroTitle && current.meta && (
            <p className={TASK_STEPPER.heroMeta}>{current.meta}</p>
          )}
          {!current.hero && current.due && (
            <span className={TASK_STEPPER.heroDue}>{current.due}</span>
          )}
        </div>

        <div className={cn(!isSolo && TASK_STEPPER.detail)}>{current.detail}</div>

        {!isSolo && (
          <nav className={TASK_STEPPER.timeline} aria-label={PERSONAL_TASK_COPY.stepperLabel}>
            {steps.map((step, offset) => {
              const stepIndex = first + offset
              const isEdge =
                (offset === 0 && first > 0) ||
                (offset === steps.length - 1 && first + steps.length < entries.length)

              return (
                <button
                  key={step.key}
                  type="button"
                  aria-label={String(stepIndex + 1)}
                  aria-current={stepIndex === position ? 'step' : undefined}
                  onClick={() => onIndex(stepIndex)}
                  className={cn(
                    TASK_STEPPER.step,
                    stepIndex < position && TASK_STEPPER.stepDone,
                    stepIndex === position && TASK_STEPPER.stepActive,
                    isEdge && TASK_STEPPER.stepEdge
                  )}
                />
              )
            })}
          </nav>
        )}
      </div>
    </Drawer>
  )
}
