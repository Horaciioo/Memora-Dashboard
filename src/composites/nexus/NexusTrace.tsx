'use client'

import { useEffect, useState } from 'react'

import { NEXUS_WINDOW } from '@/declarations/nexus/window'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import { prefersReducedMotion } from '@/utils/motion'

interface TraceLineProps {
  text: string
  onDone: () => void
}

/**
 * One line written letter by letter
 * @param {TraceLineProps} props - Line props
 * @return {JSX.Element}
 */

const TraceLine = ({ text, onDone }: TraceLineProps) => {
  const [length, setLength] = useState(prefersReducedMotion() ? text.length : 0)
  const isDone = length >= text.length

  useEffect(() => {
    if (isDone) return onDone()
    const timer = window.setTimeout(
      () => setLength((current) => current + 1),
      NEXUS_WINDOW.typeStepMs
    )

    return () => window.clearTimeout(timer)
  }, [isDone, length, onDone])

  return (
    <li className={NEXUS_STYLES.traceLine}>
      {text.slice(0, length)}
      {!isDone && <span className={NEXUS_STYLES.traceCaret} aria-hidden="true" />}
    </li>
  )
}

/**
 * Progress lines of a step, each one written after the last
 * @param {{ lines: string[] }} props - Lines in order
 * @return {JSX.Element}
 */

export const NexusTrace = ({ lines }: { lines: string[] }) => {
  const [written, setWritten] = useState(0)

  return (
    <ul className={NEXUS_STYLES.trace}>
      {lines.slice(0, written + 1).map((line, index) =>
        index < written ? (
          <li key={line} className={NEXUS_STYLES.traceLine}>
            {line}
          </li>
        ) : (
          <TraceLine
            key={line}
            text={line}
            onDone={() => setWritten((current) => Math.max(current, index + 1))}
          />
        )
      )}
    </ul>
  )
}
