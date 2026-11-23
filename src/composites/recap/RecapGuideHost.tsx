'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { MUTATION_EVENT } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { locateBox } from '@/core/lib/recap/locate'
import { useRecapGuide } from '@/core/store/recapGuide'
import type { GuideAction } from '@/core/store/recapGuide'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { varied } from '@/core/lib/assistant/variants'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { GUIDE_VARIANTS } from '@/declarations/assistant/variants/guide'
import { RECAP_SCENARIO_COPY } from '@/declarations/assistant/scenarios/recap'
import { RECAP_STYLES } from '@/declarations/ui/variants'
import { prefersReducedMotion } from '@/utils/motion'

// Room left around the lit part
const RING_PAD_PX = 4

// Quiet time between two looks for the part to light
const LOOK_MS = 150

// Settling time once the page is open, before the question comes
const GO_ONLY_MS = 700

// Page the stop wants, without its query
const pathOf = (href: string): string => href.split('?')[0]

const toBox = (rect: DOMRect) => ({
  top: rect.top - RING_PAD_PX,
  left: rect.left - RING_PAD_PX,
  width: rect.width + RING_PAD_PX * 2,
  height: rect.height + RING_PAD_PX * 2,
})

// Corner fallback keeps clear of the compact panel on the right
const FALLBACK_RIGHT_PX = 376

// Height reserved for the bubble when it sits above the part
const BUBBLE_H_PX = 150

// Room between the part and the bubble
const BUBBLE_GAP_PX = 12

// Where the bubble stands: under the lit part, above when there is no room, in the corner with none
const place = (box: ReturnType<typeof toBox> | null) => {
  if (!box) return { right: FALLBACK_RIGHT_PX, bottom: 24 }

  const left = Math.max(12, Math.min(box.left, window.innerWidth - 332))
  const below = box.top + box.height + BUBBLE_GAP_PX
  if (below + BUBBLE_H_PX < window.innerHeight) return { top: below, left }

  return { bottom: window.innerHeight - box.top + BUBBLE_GAP_PX, left }
}

/**
 * Takes the member to the page Memora speaks about, switching with a short animation,
 * rings what concerns them and ends the stop a few seconds after they act on it
 * @return {JSX.Element | null}
 */

export const RecapGuideHost = () => {
  const router = useRouter()
  const guide = useRecapGuide((state) => state.guide)
  const end = useRecapGuide((state) => state.end)
  const [box, setBox] = useState<ReturnType<typeof toBox> | null>(null)

  useEffect(() => {
    if (!guide) return

    const { href, key, label, isGoOnly } = guide
    const root = document.documentElement
    let target: Element | null = null
    let frame = 0
    let looking = 0
    let settling = 0
    let leaving = 0
    const startedAt = Date.now()

    const here = () => window.location.pathname + window.location.search
    const isSwitching = here() !== href
    const hasMotion = !prefersReducedMotion()
    let hasArrived = !isSwitching

    // The page fades out first, so the next one never pops in over it
    if (isSwitching && hasMotion) {
      root.dataset.recapSwitch = 'out'
      leaving = window.setTimeout(() => router.push(href), RECAP_SETTINGS.switchOutMs)
    } else if (isSwitching) {
      router.push(href)
    }

    // The new page rises in once it is there
    const arrive = () => {
      if (hasArrived) return

      hasArrived = true
      if (!hasMotion) return

      root.dataset.recapSwitch = 'in'
      window.setTimeout(() => delete root.dataset.recapSwitch, RECAP_SETTINGS.switchMs)
    }

    // The box of the record when the page shows it, nothing otherwise
    const find = (): Element | null =>
      window.location.pathname === pathOf(href) ? locateBox(key, label) : null

    const follow = () => {
      if (target) setBox(toBox(target.getBoundingClientRect()))
      frame = requestAnimationFrame(follow)
    }

    const look = () => {
      // Opening the page is the whole stop, the question is asked right there
      if (isGoOnly) {
        if (window.location.pathname === pathOf(href)) {
          arrive()
          settling = window.setTimeout(() => end('handled'), GO_ONLY_MS)
        } else {
          looking = window.setTimeout(look, LOOK_MS)
        }

        return
      }

      target = find()
      if (!target) {
        if (Date.now() - startedAt < RECAP_SETTINGS.guideFindMs) {
          looking = window.setTimeout(look, LOOK_MS)
          return
        }

        // Nothing to ring, the page is shown and Memora waits for the member
        arrive()
        return
      }

      arrive()
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      follow()
    }

    // A saved change is the real end of the stop, never a timer
    const onSaved = (event: Event) => {
      const path = (event as CustomEvent<{ path: string }>).detail.path
      if (settling || path.startsWith(API_ROUTES.recap().split('?')[0])) return

      // Only a save on the record of the stop counts
      if (guide.scope && !path.includes(guide.scope)) return

      settling = window.setTimeout(() => end('handled'), RECAP_SETTINGS.guideWaitMs)
    }

    look()
    window.addEventListener(MUTATION_EVENT, onSaved)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(looking)
      window.clearTimeout(settling)
      window.clearTimeout(leaving)
      if (root.dataset.recapSwitch === 'out') delete root.dataset.recapSwitch
      window.removeEventListener(MUTATION_EVENT, onSaved)
      setBox(null)
    }
  }, [guide, router, end])

  const [isDoing, setDoing] = useState(false)

  // Memora does it for the member, the stop ends once it is done
  const act = async (action: GuideAction) => {
    setDoing(true)
    try {
      await action.run()
      end('handled')
    } catch {
      // The page shows nothing wrong, the member can do it by hand
    } finally {
      setDoing(false)
    }
  }

  // One wording per stop, the lit part or not
  const lines = useMemo(
    () => ({
      here: varied('guide.waiting', GUIDE_VARIANTS.waiting),
      elsewhere: varied('guide.elsewhere', GUIDE_VARIANTS.elsewhere),
    }),
    // A new stop, a new wording
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guide]
  )

  if (!guide || guide.isGoOnly) return null

  return (
    <>
      {box && <span aria-hidden="true" className={RECAP_STYLES.guideRing} style={box} />}
      <div
        role="dialog"
        aria-label={ASSISTANT_COPY.name}
        className={RECAP_STYLES.bubble}
        style={place(box)}
      >
        <span className={RECAP_STYLES.bubbleHead}>
          <BrainMark motion="idle" className={RECAP_STYLES.bubbleMark} />
          {ASSISTANT_COPY.name}
        </span>
        <p className={RECAP_STYLES.bubbleLine}>{box ? lines.here : lines.elsewhere}</p>
        <div className={RECAP_STYLES.bubbleRow}>
          {guide.actions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={isDoing}
              onClick={() => void act(action)}
              className={RECAP_STYLES.bubbleDone}
            >
              {action.label}
            </button>
          ))}
          <button type="button" onClick={() => end('handled')} className={RECAP_STYLES.bubbleDone}>
            {RECAP_SCENARIO_COPY.doneGuide}
          </button>
          <button type="button" onClick={() => end('skipped')} className={RECAP_STYLES.bubbleSkip}>
            {RECAP_SCENARIO_COPY.skipGuide}
          </button>
        </div>
      </div>
    </>
  )
}
