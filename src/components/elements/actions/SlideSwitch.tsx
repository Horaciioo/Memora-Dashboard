'use client'

import { useEffect, useRef, useState } from 'react'
import type { ComponentType, CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { drawDotField, mixRgb, parseRgb } from '@/core/lib/ui/dotField'
import type { Rgb } from '@/core/lib/ui/dotField'
import { SLIDE_SWITCH } from '@/declarations/ui/variants'
import { prefersReducedMotion } from '@/utils/motion'

export interface SlideSwitchOption {
  value: string
  // Accessible name and tooltip
  label: string
  // Colour of the lit dots
  tint: string
  // Small mark on the stop while the thumb is elsewhere
  glyph?: ComponentType<{ className?: string }>
}

export interface SlideSwitchProps {
  options: SlideSwitchOption[]
  value: string
  onChange: (value: string) => void
  label: string
}

// Thumb size and inset, as drawn in switch.css
const THUMB = 26
const INSET = 1

// Spring of the thumb
const STIFFNESS = 220
const DAMPING = 21

/**
 * Nearest stop of a thumb position
 * @param {number} ratio - Position along the rail, 0 to 1
 * @param {number} count - Stops on the rail
 * @return {number} - Stop index
 */

const stopAt = (ratio: number, count: number): number =>
  Math.round(Math.min(Math.max(ratio, 0), 1) * (count - 1))

/**
 * Level selector in the dotted slider style: dots lighting up and fading toward a white thumb
 * that springs between the stops, by click, drag or arrow keys
 * @param {SlideSwitchOption[]} options - Stops, left to right
 * @param {string} value - Stop in force
 * @param {(value: string) => void} onChange - Choice handler
 * @param {string} label - Accessible name
 * @return {JSX.Element}
 */

export const SlideSwitch = ({ options, value, onChange, label }: SlideSwitchProps) => {
  const railRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLCanvasElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const colourRef = useRef<HTMLSpanElement>(null)
  const goal = useRef({ x: 0, drag: false })
  const [scrub, setScrub] = useState<number | null>(null)
  const count = options.length
  const current = Math.max(
    options.findIndex((option) => option.value === value),
    0
  )
  const shown = scrub ?? current
  const ThumbGlyph = options[shown]?.glyph
  const share = (index: number) => (count > 1 ? index / (count - 1) : 0)

  // Travel of the thumb in pixels
  const travelOf = (width: number) => Math.max(width - THUMB - INSET * 2, 0)

  // Spring, tint and dot field run in one frame loop
  useEffect(() => {
    const rail = railRef.current
    const field = fieldRef.current
    const thumb = thumbRef.current
    const swatch = colourRef.current
    const context = field?.getContext('2d')
    if (!rail || !field || !thumb || !swatch || !context) return

    // Spring and slide stand still for those who ask, the dots keep their flicker
    const calm = prefersReducedMotion()
    const state = { x: -1, v: 0, tint: null as Rgb | null, last: performance.now(), frame: 0 }
    let size = { width: 0, height: 0 }

    // Canvas follows the rail at device resolution
    const fit = () => {
      const box = rail.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      size = { width: box.width, height: box.height }
      field.width = Math.round(box.width * ratio)
      field.height = Math.round(box.height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const tick = (now: number) => {
      const step = Math.min((now - state.last) / 1000, 0.05)
      state.last = now

      // Thumb position, spring or straight
      const target = goal.current.x
      if (state.x < 0 || calm) state.x = target
      else if (goal.current.drag) {
        state.x += (target - state.x) * Math.min(step * 28, 1)
        state.v = 0
      } else {
        state.v += (STIFFNESS * (target - state.x) - DAMPING * state.v) * step
        state.x += state.v * step
      }

      // Tint eases toward the stop in force
      const wanted = parseRgb(getComputedStyle(swatch).color)
      state.tint = state.tint ? mixRgb(state.tint, wanted, Math.min(step * 9, 1)) : wanted

      // Thumb stretches and tilts with its speed
      const speed = Math.min(Math.abs(state.v) / 700, 1)
      const flow = goal.current.drag ? Math.min(Math.abs(target - state.x) / 40, 1) : speed
      thumb.style.transform = `translateX(${state.x}px) scale(${1 + flow * 0.2}, ${1 - flow * 0.08})`
      drawDotField({
        context,
        width: size.width,
        height: size.height,
        reach: state.x + THUMB / 2 + INSET,
        tint: state.tint,
        time: now / 1000,
        energy: flow,
      })
      state.frame = requestAnimationFrame(tick)
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(rail)
    state.frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(state.frame)
      observer.disconnect()
    }
  }, [])

  // Goal of the thumb follows the stop shown
  useEffect(() => {
    const rail = railRef.current
    if (!rail || goal.current.drag) return

    goal.current.x = INSET + travelOf(rail.clientWidth) * share(shown)
  })

  const choose = (index: number) => {
    const next = options[index]
    if (next && next.value !== value) onChange(next.value)
  }

  // Pointer along the rail
  const ratioAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = railRef.current!.getBoundingClientRect()

    return (event.clientX - box.left - THUMB / 2 - INSET) / travelOf(box.width)
  }

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const ratio = Math.min(Math.max(ratioAt(event), 0), 1)
    const rail = railRef.current!

    goal.current = { x: INSET + travelOf(rail.clientWidth) * ratio, drag: true }
    setScrub(stopAt(ratio, count))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return

    event.preventDefault()
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    choose(Math.min(Math.max(current + step, 0), count - 1))
  }

  return (
    <div role="radiogroup" aria-label={label} className={SLIDE_SWITCH.root} onKeyDown={onKeyDown}>
      <span
        ref={colourRef}
        aria-hidden="true"
        style={{ color: options[shown]!.tint }}
        className="hidden"
      />

      <div
        ref={railRef}
        className={SLIDE_SWITCH.rail}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          follow(event)
        }}
        onPointerMove={(event) => {
          if (goal.current.drag) follow(event)
        }}
        onPointerUp={(event) => {
          const index = stopAt(ratioAt(event), count)
          goal.current.drag = false
          setScrub(null)
          choose(index)
        }}
        onPointerCancel={() => {
          goal.current.drag = false
          setScrub(null)
        }}
      >
        <canvas ref={fieldRef} className={SLIDE_SWITCH.field} aria-hidden="true" />

        {options.map((option, index) => {
          if (index === shown) return null
          const Glyph = option.glyph
          const mark: CSSProperties = {
            left: `calc(${INSET + THUMB / 2}px + (100% - ${THUMB + INSET * 2}px) * ${share(index)})`,
            width: Glyph ? undefined : index === 0 ? 4 : 3,
            height: Glyph ? undefined : index === 0 ? 4 : 12,
            color: option.tint,
          }

          return (
            <span
              key={option.value}
              className={Glyph ? SLIDE_SWITCH.glyphMark : SLIDE_SWITCH.mark}
              style={mark}
              aria-hidden="true"
            >
              {Glyph && <Glyph className={SLIDE_SWITCH.glyph} />}
            </span>
          )
        })}

        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={index === current}
            aria-label={option.label}
            title={option.label}
            tabIndex={index === current ? 0 : -1}
            className={SLIDE_SWITCH.hit}
            style={{ left: `${(index / count) * 100}%`, width: `${100 / count}%` }}
            onClick={(event) => event.detail === 0 && choose(index)}
          />
        ))}

        <span ref={thumbRef} className={SLIDE_SWITCH.thumb} aria-hidden="true">
          <span key={shown} className={SLIDE_SWITCH.thumbFace} style={{ color: options[shown]!.tint }}>
            {ThumbGlyph ? <ThumbGlyph className={SLIDE_SWITCH.thumbGlyph} /> : null}
          </span>
        </span>
      </div>
    </div>
  )
}
