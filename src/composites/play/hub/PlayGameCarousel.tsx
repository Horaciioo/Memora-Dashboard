'use client'

import { useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'

import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayGameCarouselProps {
  title: string
  games: { game: PlayGameName; playable: boolean }[]
  onLocked: () => void
}

/**
 * One row of cards side by side, the middle one larger, left and right to browse
 * @param {PlayGameCarouselProps} props - Row
 * @return {JSX.Element}
 */

export const PlayGameCarousel = ({ title, games, onLocked }: PlayGameCarouselProps) => {
  const [at, setAt] = useState(Math.floor((games.length - 1) / 2))
  const ChevronIcon = ICONS.expand
  const go = (index: number) => setAt(Math.min(games.length - 1, Math.max(0, index)))

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(at - 1)
    if (event.key === 'ArrowRight') go(at + 1)
  }

  return (
    <section className={PLAY_CROSS.row} aria-label={title}>
      <h2 className={PLAY_CROSS.rowTitle}>{title}</h2>
      <div
        className={PLAY_CROSS.track}
        role="group"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKey}
      >
        <div className={PLAY_CROSS.strip} style={{ '--at': at } as CSSProperties}>
          {games.map((entry, index) => (
            <div key={entry.game} data-active={index === at} className={PLAY_CROSS.slot}>
              <PlayGameCard {...entry} onLocked={onLocked} className={PLAY_CROSS.card} />
              {index !== at && (
                <button
                  type="button"
                  aria-label={PLAY_GAMES.label(entry.game)}
                  className={PLAY_CROSS.slotPick}
                  onClick={() => go(index)}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label={PLAY_HUB_COPY.carouselPrev}
          disabled={at === 0}
          className={cn(PLAY_CROSS.arrow, PLAY_CROSS.arrowPrev)}
          onClick={() => go(at - 1)}
        >
          <ChevronIcon className={cn(PLAY_CROSS.arrowIcon, 'rotate-90')} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={PLAY_HUB_COPY.carouselNext}
          disabled={at === games.length - 1}
          className={cn(PLAY_CROSS.arrow, PLAY_CROSS.arrowNext)}
          onClick={() => go(at + 1)}
        >
          <ChevronIcon className={cn(PLAY_CROSS.arrowIcon, '-rotate-90')} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
