'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { useWritten } from '@/core/hooks/interaction/scenes/useWritten'
import { ASSISTANT_COPY, ASSISTANT_INTRO_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_BUBBLE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { SECOND_MS } from '@/utils/constants/time'

export interface MemoraBubbleProps {
  text: string
  // Arrow clicked, the talk goes on her page
  onEnter: () => void
  // Closed by the cross, or folded after a while
  onDismiss: () => void
}

/**
 * Memora asking, bottom centre, opens left to right, writes her sentence, goes anywhere
 * @param {string} text - One sentence
 * @param {() => void} onEnter - Arrow clicked
 * @param {() => void} onDismiss - Bubble sent away
 * @return {JSX.Element}
 */

export const MemoraBubble = ({ text, onEnter, onDismiss }: MemoraBubbleProps) => {
  const ArrowGlyph = ICONS.forward
  const CloseGlyph = ICONS.close
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isLeaving, setLeaving] = useState(false)
  // Frame of the bubble, then the whole window
  const [frame, setFrame] = useState<'rest' | 'start' | 'full'>('rest')
  const root = useRef<HTMLDivElement>(null)
  const [from, setFrom] = useState<DOMRect | null>(null)
  const grab = useRef<{ x: number; y: number; box: DOMRect; from: typeof offset } | null>(null)
  const timer = useRef<number>(0)
  // The sentence starts once the bubble is open
  const written = useWritten(
    text.length,
    Math.ceil(ASSISTANT_SETTINGS.bubbleOpenMs / ASSISTANT_SETTINGS.typingMsPerChar)
  )

  // Pending closing dies with the bubble
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const leave = (then: () => void) => {
    setLeaving(true)
    timer.current = window.setTimeout(then, ASSISTANT_SETTINGS.bubbleGrowMs)
  }

  // Nobody answered, she folds away by herself
  useEffect(() => {
    const stay = window.setTimeout(
      () => frame === 'rest' && leave(onDismiss),
      ASSISTANT_SETTINGS.bubbleStaySeconds * SECOND_MS
    )

    return () => window.clearTimeout(stay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  // The bubble takes the whole page, then the page itself opens
  const expand = () => {
    setFrom(root.current?.getBoundingClientRect() ?? null)
    setFrame('start')
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        setFrame('full')
        timer.current = window.setTimeout(onEnter, ASSISTANT_SETTINGS.bubbleExpandMs)
      })
    )
  }

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (frame !== 'rest' || (event.target as HTMLElement).closest('button')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    grab.current = {
      x: event.clientX,
      y: event.clientY,
      box: event.currentTarget.getBoundingClientRect(),
      from: offset,
    }
  }

  // Taken anywhere, never out of the window
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = grab.current
    if (!start) return

    const dx = Math.min(
      Math.max(event.clientX - start.x, -start.box.left),
      window.innerWidth - start.box.right
    )
    const dy = Math.min(
      Math.max(event.clientY - start.y, -start.box.top),
      window.innerHeight - start.box.bottom
    )
    setOffset({ x: start.from.x + dx, y: start.from.y + dy })
  }

  return (
    <div
      ref={root}
      role="status"
      style={
        frame === 'rest'
          ? { translate: `${offset.x}px ${offset.y}px` }
          : ({
              inset: 'auto',
              margin: 0,
              translate: '0 0',
              transitionDuration: `${ASSISTANT_SETTINGS.bubbleExpandMs}ms`,
              ...(frame === 'start' && from
                ? {
                    top: from.top,
                    left: from.left,
                    width: from.width,
                    height: from.height,
                  }
                : { top: 0, left: 0, width: '100vw', height: '100dvh', borderRadius: 0 }),
            } satisfies CSSProperties)
      }
      className={cn(
        ASSISTANT_BUBBLE_STYLES.root,
        isLeaving && ASSISTANT_BUBBLE_STYLES.rootLeaving,
        frame !== 'rest' && ASSISTANT_BUBBLE_STYLES.rootExpanding
      )}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => (grab.current = null)}
      onPointerCancel={() => (grab.current = null)}
    >
      <BrainMark motion="idle" className={ASSISTANT_BUBBLE_STYLES.mark} />
      <p className={ASSISTANT_BUBBLE_STYLES.line}>
        <span className="sr-only">{text}</span>
        <span className={ASSISTANT_BUBBLE_STYLES.lineGhost} aria-hidden="true">
          {text}
        </span>
        <span className={ASSISTANT_BUBBLE_STYLES.lineWritten} aria-hidden="true">
          {text.slice(0, written)}
          {written < text.length && <span className={ASSISTANT_BUBBLE_STYLES.caret} />}
        </span>
      </p>
      <button
        type="button"
        aria-label={ASSISTANT_INTRO_COPY.close}
        onClick={() => leave(onDismiss)}
        className={ASSISTANT_BUBBLE_STYLES.close}
      >
        <CloseGlyph className={ASSISTANT_BUBBLE_STYLES.closeGlyph} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={ASSISTANT_COPY.name}
        onClick={expand}
        className={ASSISTANT_BUBBLE_STYLES.enter}
      >
        <ArrowGlyph className={ASSISTANT_BUBBLE_STYLES.enterGlyph} aria-hidden="true" />
      </button>
    </div>
  )
}
