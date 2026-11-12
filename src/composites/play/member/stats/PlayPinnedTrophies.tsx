'use client'

import { useState } from 'react'

import { PlayGoldSparkles } from '@/composites/play/member/stats/PlayGoldSparkles'
import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { PLAY_HUB_COPY, trophiesOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'
import { cn } from '@/utils/classnames'

// Trophies pinned on the profile
const PINNED = 8

/**
 * Whole collection, folded under the pins
 * @param {Object} props - Totals
 * @param {PlayProfileView['global']} props.global - Global totals
 * @return {JSX.Element}
 */

const Collection = ({ global }: { global: PlayProfileView['global'] }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        className={PLAY_CAREER.pinMore}
        onClick={() => setOpen((value) => !value)}
      >
        {isOpen ? PLAY_HUB_COPY.hideCollection : PLAY_HUB_COPY.showCollection}
      </button>
      {isOpen && <PlayTrophies global={global} isBare />}
    </>
  )
}

/**
 * Eight trophies on show, won first then the closest, the whole collection one tap away
 * @param {Object} props - Totals
 * @param {PlayProfileView['global']} props.global - Global totals
 * @return {JSX.Element}
 */

export const PlayPinnedTrophies = ({ global }: { global: PlayProfileView['global'] }) => {
  const pins = trophiesOf(global)
    .sort((left, right) => Number(right.reached) - Number(left.reached) || right.share - left.share)
    .slice(0, PINNED)

  return (
    <>
      <ul className={PLAY_CAREER.pins}>
        {pins.map((trophy) => {
          const Icon = ICONS[trophy.icon]

          return (
            <li
              key={trophy.label}
              className={cn(
                PLAY_CAREER.pin,
                !trophy.reached && !trophy.share && PLAY_CAREER.pinIdle
              )}
            >
              <span className={cn(PLAY_CAREER.pinIcon, trophy.reached && PLAY_CAREER.pinIconOn)}>
                <Icon className={PLAY_CAREER.pinGlyph} aria-hidden="true" />
                {trophy.reached && <PlayGoldSparkles />}
              </span>
              <span className={PLAY_CAREER.pinName}>{trophy.label}</span>
            </li>
          )
        })}
      </ul>
      <Collection global={global} />
    </>
  )
}
