'use client'

import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { playDeckCard } from '@/composites/play/golf/sound'
import { deckPlan } from '@/core/lib/play/golf'
import type { GolfDeckPose } from '@/core/lib/play/golf'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { GOLF_VOTE_COPY, GOLF_VOTE_TIMING } from '@/declarations/play/golf/vote'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_DECK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

const TIMING = GOLF_VOTE_TIMING.deck
// Wait between two tries to start the game once the draw is over
const RETRY_MS = 1000

export interface GolfTournamentDeckProps {
  // Courses of the tournament, in play order
  plan: string[]
  // Server ms the draw started
  dealtAt: number
  // Server ms the draw ends
  endsAt: number
  // Server ms at the page render
  serverTime: number
  // Game id, same crooked pile on every screen
  seed: string
  // Thumbnails drawn so far
  shots: Map<string, string>
  // Draw over, the game may start
  onDone: () => void
}

/**
 * Transform of a pose
 * @param {GolfDeckPose} pose - Pose
 * @param {string} unit - Card width, px or a CSS length
 * @return {string} - CSS transform
 */

const transformOf = ({ x, y, tilt, scale }: GolfDeckPose, unit: string) =>
  `translate(-50%, -50%) translate(calc(${unit} * ${x}), calc(${unit} * ${y})) rotate(${tilt}deg) scale(${scale})`

/**
 * Still style of a pose
 * @param {GolfDeckPose} pose - Pose
 * @return {CSSProperties} - Style
 */

const restOf = (pose: GolfDeckPose): CSSProperties => ({
  transform: transformOf(pose, 'var(--deck-card)'),
  opacity: pose.opacity,
})

/**
 * Play a timeline of poses on a card and its flip, joined at the time already spent
 * @param {HTMLElement} card - Card
 * @param {GolfDeckPose[]} poses - Timeline
 * @param {number} total - Ms of the draw
 * @param {number} elapsed - Ms already spent
 * @return {Animation[]} - Running animations
 */

const animateCard = (card: HTMLElement, poses: GolfDeckPose[], total: number, elapsed: number) => {
  const unit = `${card.offsetWidth}px`
  const timing = { duration: total, delay: -elapsed, fill: 'both' as const }
  const frames = poses.map((pose) => ({
    offset: pose.at / total,
    transform: transformOf(pose, unit),
    opacity: pose.opacity,
    easing: 'cubic-bezier(0.35, 0, 0.2, 1)',
  }))
  const flips = poses.map((pose) => ({
    offset: pose.at / total,
    transform: `rotateY(${pose.isFaceUp ? 0 : 180}deg)`,
  }))
  const flip = card.firstElementChild as HTMLElement | null

  return [card.animate(frames, timing), ...(flip ? [flip.animate(flips, timing)] : [])]
}

/**
 * Moments a card swishes, ms from the start
 * @param {number} cards - Catalogue cards
 * @param {number} dealt - Cards dealt
 * @return {{ at: number, isDeal: boolean }[]} - Sound cues
 */

const cuesOf = (cards: number, dealt: number) => {
  const stacked = TIMING.hold + Math.max(cards - 1, 0) * TIMING.stackGap + TIMING.stack

  return [
    ...Array.from({ length: cards }, (_, index) => ({
      at: TIMING.hold + index * TIMING.stackGap,
      isDeal: false,
    })),
    { at: stacked, isDeal: false },
    ...Array.from({ length: dealt }, (_, index) => ({
      at: stacked + TIMING.move + index * TIMING.dealGap + TIMING.deal,
      isDeal: true,
    })),
  ]
}

/**
 * Faces of a course card, the shot on top, the deck back under
 * @param {Object} props - Card
 * @param {string} props.course - Course key
 * @param {string} [props.shot] - Thumbnail
 * @return {JSX.Element}
 */

const DeckFaces = ({ course, shot }: { course: string; shot?: string }) => {
  const BackIcon = ICONS.golfFlag

  return (
    <>
      <span className={GOLF_DECK.side}>
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot} alt="" className={GOLF_DECK.shot} />
        ) : (
          <span className={GOLF_DECK.name}>{GOLF_COURSES.label(course)}</span>
        )}
      </span>
      <span className={cn(GOLF_DECK.side, GOLF_DECK.back)}>
        <BackIcon className={GOLF_DECK.backGlyph} aria-hidden="true" />
      </span>
    </>
  )
}

/**
 * Tournament draw: the course cards gather in a crooked deck, the deck slides top left,
 * deals one card per course of the plan in play order, then fades. Synced on the server clock,
 * a late player or reduced motion sees the dealt plan at once
 * @param {GolfTournamentDeckProps} props - Plan and clock
 * @return {JSX.Element}
 */

export const GolfTournamentDeck = ({
  plan,
  dealtAt,
  endsAt,
  serverTime,
  seed,
  shots,
  onDone,
}: GolfTournamentDeckProps) => {
  const courses = GOLF_COURSES.keys
  const timeline = useMemo(
    () => deckPlan(courses.length, plan.length, seed),
    [courses.length, plan.length, seed]
  )
  const pileRefs = useRef<(HTMLDivElement | null)[]>([])
  const dealtRefs = useRef<(HTMLDivElement | null)[]>([])
  const done = useEffectEvent(onDone)
  // Late player or reduced motion: the dealt plan at once
  const [isStill] = useState(
    () =>
      serverTime - dealtAt > TIMING.lateJoin ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Timeline joined at the right moment, or skipped to its end
  useEffect(() => {
    if (isStill) return
    const elapsed = serverTime - dealtAt
    const offset = serverTime - Date.now()
    const animations = [
      ...timeline.pile.map((poses, index) => [pileRefs.current[index], poses] as const),
      ...timeline.dealt.map((poses, index) => [dealtRefs.current[index], poses] as const),
    ].flatMap(([card, poses]) =>
      card ? animateCard(card, poses, timeline.total, Math.max(0, elapsed)) : []
    )
    const timers = cuesOf(courses.length, plan.length).map(({ at, isDeal }) =>
      window.setTimeout(() => playDeckCard(isDeal), dealtAt + at - (Date.now() + offset))
    )

    return () => {
      animations.forEach((animation) => animation.cancel())
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [isStill, timeline, dealtAt, serverTime, courses.length, plan.length])

  // Game started once the draw is over, retried until the server answers
  useEffect(() => {
    const offset = serverTime - Date.now()
    let lastTry = 0
    const id = window.setInterval(() => {
      if (Date.now() + offset < endsAt || Date.now() - lastTry < RETRY_MS) return
      lastTry = Date.now()
      done()
    }, RETRY_MS / 4)

    return () => window.clearInterval(id)
  }, [endsAt, serverTime])

  const poseAt = (poses: GolfDeckPose[]) => (isStill ? poses.at(-1) : poses[0]) as GolfDeckPose

  return (
    <div className={GOLF_DECK.scroller}>
      <div
        className={GOLF_DECK.stage}
        style={
          {
            '--deck-span': timeline.stage.width,
            width: `calc(var(--deck-card) * ${timeline.stage.width})`,
            height: `calc(var(--deck-card) * ${timeline.stage.height})`,
          } as CSSProperties
        }
      >
        {courses.map((course, index) => {
          const pose = poseAt(timeline.pile[index])

          return (
            <div
              key={course}
              ref={(node) => {
                pileRefs.current[index] = node
              }}
              className={GOLF_DECK.card}
              style={restOf(pose)}
              aria-hidden="true"
            >
              <div
                className={GOLF_DECK.flip}
                style={{ transform: `rotateY(${pose.isFaceUp ? 0 : 180}deg)` }}
              >
                <DeckFaces course={course} shot={shots.get(course)} />
              </div>
            </div>
          )
        })}
        {plan.map((course, index) => {
          const pose = poseAt(timeline.dealt[index])

          return (
            <div
              key={`${course}-${index}`}
              ref={(node) => {
                dealtRefs.current[index] = node
              }}
              className={GOLF_DECK.card}
              style={restOf(pose)}
            >
              <div
                className={GOLF_DECK.flip}
                style={{ transform: `rotateY(${pose.isFaceUp ? 0 : 180}deg)` }}
              >
                <DeckFaces course={course} shot={shots.get(course)} />
              </div>
              <span className={GOLF_DECK.slot}>
                {fillPlayMessage(GOLF_VOTE_COPY.deckSlot, { n: index + 1 })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
