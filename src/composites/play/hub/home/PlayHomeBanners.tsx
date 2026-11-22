'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { PLAY_HOME_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HOME } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayHomeBannersProps {
  // Banners in the slider
  count: number
  children: ReactNode
}

/**
 * Slider over the banners: arrows on the sides, one dot per banner
 * @param {PlayHomeBannersProps} props - Banners
 * @return {JSX.Element}
 */

export const PlayHomeBanners = ({ count, children }: PlayHomeBannersProps) => {
  const host = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const PreviousIcon = ICONS.playPrevious
  const NextIcon = ICONS.playNext

  // Slides of the track
  const slides = () => Array.from(host.current?.firstElementChild?.children ?? [])
  const go = (to: number) =>
    slides()[to]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })

  // Slide nearest the left edge
  const track = (element: HTMLElement) => {
    const [first, second] = slides() as HTMLElement[]
    if (first && second)
      setIndex(Math.round(element.scrollLeft / (second.offsetLeft - first.offsetLeft)))
  }

  return (
    <div
      ref={host}
      className={PLAY_HOME.banners}
      onScrollCapture={(event) => track(event.target as HTMLElement)}
    >
      {children}
      {count > 1 && (
        <div className={PLAY_HOME.dots}>
          <button
            type="button"
            aria-label={PLAY_HOME_COPY.previous}
            disabled={index === 0}
            className={PLAY_HOME.arrow}
            onClick={() => go(index - 1)}
          >
            <PreviousIcon className={PLAY_HOME.arrowIcon} aria-hidden="true" />
          </button>
          {Array.from({ length: count }, (_, position) => (
            <button
              key={position}
              type="button"
              aria-label={`${PLAY_HOME_COPY.banner} ${position + 1}`}
              aria-current={position === index}
              className={cn(PLAY_HOME.dot, position === index && PLAY_HOME.dotOn)}
              onClick={() => go(position)}
            />
          ))}
          <button
            type="button"
            aria-label={PLAY_HOME_COPY.next}
            disabled={index === count - 1}
            className={PLAY_HOME.arrow}
            onClick={() => go(index + 1)}
          >
            <NextIcon className={PLAY_HOME.arrowIcon} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
