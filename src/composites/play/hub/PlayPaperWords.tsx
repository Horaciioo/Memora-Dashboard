'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { advancePen, PEN_START } from '@/core/lib/play/paperWords'
import { PLAY_PAPER } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'

/**
 * Tracks of a grid read from its computed style
 * @param {string} template - Computed track list
 * @return {number} - Tracks
 */

const tracksOf = (template: string): number =>
  template.split(' ').filter((track) => track.endsWith('px')).length

/**
 * One name at a time written on a line of the notebook in blue pen, now and then misspelled
 * @return {JSX.Element}
 */

export const PlayPaperWords = () => {
  const layer = useRef<HTMLDivElement>(null)
  const [pen, setPen] = useState(PEN_START)
  const { note, shown } = pen

  // One step of the pen per delay
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const style = layer.current && getComputedStyle(layer.current)
      if (!style) return
      setPen((current) =>
        advancePen(current, tracksOf(style.gridTemplateColumns), tracksOf(style.gridTemplateRows))
      )
    }, PLAY_PAPER.pace[pen.phase])

    return () => window.clearTimeout(timer)
  }, [pen])

  return (
    <div ref={layer} className={PLAY_HUB.words} aria-hidden="true">
      {note && (
        <span
          key={`${note.row}:${note.col}`}
          className={PLAY_HUB.word}
          style={
            {
              '--col': note.col,
              '--row': note.row,
              '--tilt': `${note.tilt}deg`,
            } as CSSProperties
          }
        >
          {note.text.slice(0, shown)}
        </span>
      )}
    </div>
  )
}
