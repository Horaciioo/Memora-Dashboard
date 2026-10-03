'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { usePimTimeline } from '@/core/hooks/data/usePimTimeline'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS, destinationHref } from '@/declarations/academy/guides'
import { ACADEMY_STAGE_REGISTRY, STEP_OWNER_REGISTRY } from '@/declarations/academy/registries'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { ICONS } from '@/declarations/ui/icons'
import { PIM_TIMELINE } from '@/declarations/ui/variants'
import type { PimTimeline, PimTimelineStep } from '@/types/academy'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface PimTimelineBoardProps {
  initialTimeline: PimTimeline
  canAdvance: boolean
}

// Node and body classes per position
const NODE_STYLES = {
  current: PIM_TIMELINE.nodeCurrent,
  done: PIM_TIMELINE.nodeDone,
  upcoming: PIM_TIMELINE.nodeIdle,
} as const

/**
 * Glyph of a step, a plain check once passed
 * @param {PimTimelineStep} step - Step drawn
 * @return {JSX.Element}
 */

const StepNode = ({ step }: { step: PimTimelineStep }) => {
  const Icon = step.position === 'done' ? ICONS.confirm : ICONS[step.icon ?? 'clock']

  return (
    <span className={cn(PIM_TIMELINE.node, NODE_STYLES[step.position])} aria-hidden="true">
      <Icon className={PIM_TIMELINE.nodeIcon} />
    </span>
  )
}

/**
 * Vertical PIM timeline, the step in course in colour and every other one greyed. Each step
 * says with its glyph what must happen, the one in course opening its walkthrough
 * @param {PimTimeline} initialTimeline - Timeline resolved server-side
 * @param {boolean} canAdvance - Member may move the timeline
 * @return {JSX.Element}
 */

export const PimTimelineBoard = ({ initialTimeline, canAdvance }: PimTimelineBoardProps) => {
  const { timeline, isSaving, advance } = usePimTimeline(initialTimeline)
  const [confirming, setConfirming] = useState(false)
  const Lock = ICONS.lock

  if (timeline.steps.length === 0) {
    return (
      <EmptyState
        figure="academy"
        title={ACADEMY_COPY.juniorTimelineEmptyTitle}
        description={ACADEMY_COPY.juniorTimelineEmptyDescription}
        action={<Button disabled>{ACADEMY_COPY.timelineAdvance}</Button>}
      />
    )
  }

  return (
    <div className={PIM_TIMELINE.wrapper}>
      {timeline.lock && (
        <p className={PIM_TIMELINE.lock}>
          <Lock className={PIM_TIMELINE.lockIcon} aria-hidden="true" />
          {ACADEMY_COPY.timelineLocks[timeline.lock]}
        </p>
      )}

      <ol className={PIM_TIMELINE.list} {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiTimeline }}>
        {timeline.steps.map((step, index) => {
          const isCurrent = step.position === 'current'
          const isLast = index === timeline.steps.length - 1

          return (
            <li
              key={step.id}
              className={PIM_TIMELINE.item}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {!isLast && (
                <span
                  className={cn(
                    PIM_TIMELINE.rail,
                    step.position === 'done' ? PIM_TIMELINE.railDone : PIM_TIMELINE.railIdle
                  )}
                  aria-hidden="true"
                />
              )}
              <StepNode step={step} />

              <div className={cn(PIM_TIMELINE.body, !isCurrent && PIM_TIMELINE.bodyMuted)}>
                <span className={PIM_TIMELINE.eyebrow}>
                  {[
                    ACADEMY_STAGE_REGISTRY.label(step.stage),
                    isCurrent ? ACADEMY_COPY.timelineCurrent : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className={isCurrent ? PIM_TIMELINE.titleCurrent : PIM_TIMELINE.title}>
                  {step.title}
                </span>
                <span className={PIM_TIMELINE.meta}>
                  {[
                    step.owner
                      ? `${ACADEMY_COPY.timelineOwner} ${STEP_OWNER_REGISTRY.label(step.owner)}`
                      : null,
                    step.validatedAt
                      ? `${ACADEMY_COPY.timelineDoneOn} ${formatDay(step.validatedAt)}`
                      : step.scheduledAt
                        ? `${ACADEMY_COPY.timelineDue} ${formatDay(step.scheduledAt)}`
                        : null,
                    step.validatedByName,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {step.description && <p className={PIM_TIMELINE.description}>{step.description}</p>}

                {isCurrent && (step.guide || step.destination || canAdvance) && (
                  <div className={PIM_TIMELINE.card}>
                    {step.guide && (
                      <div className="flex flex-col gap-2">
                        <span className={PIM_TIMELINE.guideTitle}>
                          {ACADEMY_COPY.timelineGuide}
                        </span>
                        <Markdown source={step.guide} />
                      </div>
                    )}
                    <div className={PIM_TIMELINE.actions}>
                      {step.destination && (
                        <Link
                          href={destinationHref(step.destination, {
                            sessionId: timeline.sessionId,
                            juniorId: timeline.juniorId,
                          })}
                        >
                          <Button icon="forward">{ACADEMY_COPY.timelineGo}</Button>
                        </Link>
                      )}
                      {canAdvance && (
                        <span {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiAdvance }}>
                          <Button
                            variant="primary"
                            icon="climb"
                            disabled={isSaving || timeline.lock !== null}
                            onClick={() => setConfirming(true)}
                          >
                            {ACADEMY_COPY.timelineAdvance}
                          </Button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <ConfirmDialog
        open={confirming}
        title={ACADEMY_COPY.timelineAdvanceTitle}
        description={ACADEMY_COPY.timelineAdvanceDescription}
        tone="success"
        pending={isSaving}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          await advance()
          setConfirming(false)
        }}
      />
    </div>
  )
}
