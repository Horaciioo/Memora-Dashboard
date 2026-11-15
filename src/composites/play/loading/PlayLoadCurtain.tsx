'use client'

import type { CSSProperties } from 'react'

import { PLAY_LOADING } from '@/declarations/play'
import { PLAY_LOADING_STYLES } from '@/declarations/ui/variants'

const { columns, rows, waveMs } = PLAY_LOADING.curtain

// Same shuffle every render, no random in render
const delayOf = (index: number, seed: number): number => (((index + seed) * 7919) % 97) / 97

/**
 * Two salves of squares: a light one covers the screen, a deep one lands on it; leaving, the deep one goes first
 * @param {Object} props - Curtain
 * @param {boolean} props.isOpen - Squares leaving
 * @param {boolean} props.isInstant - Already covering, no entrance
 * @return {JSX.Element}
 */

export const PlayLoadCurtain = ({ isOpen, isInstant }: { isOpen: boolean; isInstant: boolean }) => (
  <>
    {[0, 1].map((salve) => {
      // Light salve first coming, last going
      const start = isOpen ? (1 - salve) * waveMs : salve * waveMs

      return (
        <div
          key={salve}
          className={PLAY_LOADING_STYLES.curtain}
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          aria-hidden="true"
        >
          {Array.from({ length: columns * rows }, (_, index) => (
            <span
              key={index}
              className={
                isOpen
                  ? PLAY_LOADING_STYLES.squareOut
                  : isInstant
                    ? PLAY_LOADING_STYLES.squareOn
                    : PLAY_LOADING_STYLES.squareIn
              }
              data-salve={salve}
              style={
                {
                  '--square-delay': `${Math.round(start + delayOf(index, salve * 31) * waveMs)}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )
    })}
  </>
)
