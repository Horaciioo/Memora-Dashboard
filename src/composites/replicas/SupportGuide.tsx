'use client'

import { useState } from 'react'

import type { GuideStep } from '@/declarations/academy/curriculum/types'
import { DISCORD_REPLICA_COPY } from '@/declarations/replicas/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SUPPORT_GUIDE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SupportGuideProps {
  steps: GuideStep[]
  // Step the scene stands on
  current: number | null
}

/**
 * Notch on the left of a simulation
 * @param {GuideStep[]} steps - Steps of the guide
 * @param {number | null} current - Step in force
 * @return {JSX.Element}
 */

export const SupportGuide = ({ steps, current }: SupportGuideProps) => {
  const [isOpen, setOpen] = useState(false)
  const Open = ICONS.forward
  const Close = ICONS.close
  const reached = current ?? -1
  // Rail filled up to the middle of the step in force
  const fill = steps.length > 1 ? Math.max(0, reached) / (steps.length - 1) : 0

  if (!isOpen) {
    return (
      <button
        type="button"
        className={SUPPORT_GUIDE.notch}
        aria-label={DISCORD_REPLICA_COPY.guideOpen}
        onClick={() => setOpen(true)}
      >
        <Open className={SUPPORT_GUIDE.notchIcon} aria-hidden="true" />
      </button>
    )
  }

  return (
    <aside className={SUPPORT_GUIDE.panel} aria-label={DISCORD_REPLICA_COPY.guideTitle}>
      <header className={SUPPORT_GUIDE.panelHead}>
        <p className={SUPPORT_GUIDE.panelTitle}>{DISCORD_REPLICA_COPY.guideTitle}</p>
        <button
          type="button"
          className={SUPPORT_GUIDE.close}
          aria-label={DISCORD_REPLICA_COPY.guideClose}
          onClick={() => setOpen(false)}
        >
          <Close className={SUPPORT_GUIDE.closeIcon} aria-hidden="true" />
        </button>
      </header>
      <ol className={SUPPORT_GUIDE.steps}>
        <span className={SUPPORT_GUIDE.rail} aria-hidden="true" />
        <span
          className={SUPPORT_GUIDE.railFill}
          style={{ height: `calc((100% - 1rem) * ${fill})` }}
          aria-hidden="true"
        />
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(SUPPORT_GUIDE.step, index > reached && SUPPORT_GUIDE.stepDim)}
            aria-current={index === reached ? 'step' : undefined}
          >
            <span
              className={cn(
                SUPPORT_GUIDE.dot,
                index > reached && SUPPORT_GUIDE.dotTodo,
                index < reached && SUPPORT_GUIDE.dotDone,
                index === reached && SUPPORT_GUIDE.dotCurrent
              )}
            >
              {index + 1}
            </span>
            <p className={SUPPORT_GUIDE.stepTitle}>{step.title}</p>
            <ul className={SUPPORT_GUIDE.tips}>
              {step.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </aside>
  )
}
