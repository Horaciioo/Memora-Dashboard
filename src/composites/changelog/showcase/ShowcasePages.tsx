import type { CSSProperties } from 'react'

import { ShowcaseReveal } from '@/composites/changelog/showcase/ShowcaseReveal'
import { SHOWCASE_COPY } from '@/declarations/changelog/showcase'
import { ICONS } from '@/declarations/ui/icons'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcasePagesProps {
  step: number
}

// Filled share of each line
const LINES = ['w-full', 'w-5/6', 'w-full', 'w-2/5'] as const

// Lines in sequence
const LINE_DELAY_MS = 120

// Sparks around the avatars
const SPARKS = 10

/**
 * Private switch, page filling, invites
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcasePages = ({ step }: ShowcasePagesProps) => {
  const PageIcon = ICONS.page
  const LockIcon = ICONS.lock
  const isPrivate = step >= 7
  const isFilled = step >= 9

  return (
    <>
      <div className={SHOWCASE.switchTrack}>
        <span className={cn(SHOWCASE.switchPill, isPrivate && SHOWCASE.switchPillPrivate)} />
        <span className={cn(SHOWCASE.switchLabel, !isPrivate && SHOWCASE.switchLabelOn)}>
          {SHOWCASE_COPY.shared}
        </span>
        <span className={cn(SHOWCASE.switchLabel, isPrivate && SHOWCASE.switchLabelOn)}>
          {SHOWCASE_COPY.private}
        </span>
      </div>

      <ShowcaseReveal isOn={step >= 8} className={SHOWCASE.page}>
        <div className={SHOWCASE.pageHead}>
          <PageIcon className={SHOWCASE.pageGlyph} aria-hidden="true" />
          {isFilled ? SHOWCASE_COPY.pageTitle : SHOWCASE_COPY.newPage}
          <LockIcon className={SHOWCASE.lock} aria-hidden="true" />
        </div>
        {LINES.map((width, index) => (
          <span
            key={index}
            className={cn(SHOWCASE.line, isFilled ? width : 'w-0')}
            style={{ transitionDelay: `${index * LINE_DELAY_MS}ms` }}
          />
        ))}
      </ShowcaseReveal>

      <ShowcaseReveal isOn={step >= 11} className={SHOWCASE.people}>
        <span className={SHOWCASE.invite}>{SHOWCASE_COPY.invite}</span>
        <span className={SHOWCASE.avatars}>
          {SHOWCASE_COPY.initials.map((initial, index) => (
            <span
              key={initial}
              className={cn(
                SHOWCASE.avatar,
                SHOWCASE.avatarTones[index],
                step >= 12 ? SHOWCASE.avatarShown : SHOWCASE.avatarHidden
              )}
              style={{ transitionDelay: `${index * LINE_DELAY_MS}ms` }}
            >
              {initial}
            </span>
          ))}
        </span>
        {step >= 13 && (
          <>
            <span className={SHOWCASE.invited}>{SHOWCASE_COPY.invited}</span>
            <span className={SHOWCASE.burst} aria-hidden="true">
              {Array.from({ length: SPARKS }, (_, index) => (
                <span
                  key={index}
                  className={cn(SHOWCASE.spark, SHOWCASE.sparkTones[index % 3])}
                  style={{ '--angle': `${(360 / SPARKS) * index}deg` } as CSSProperties}
                />
              ))}
            </span>
          </>
        )}
      </ShowcaseReveal>
    </>
  )
}
