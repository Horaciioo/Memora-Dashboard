'use client'

import Image from 'next/image'

import { usePlayLoadingProgress } from '@/core/hooks/interaction/state/play/usePlayLoadingProgress'
import { APP_ASSETS } from '@/declarations/app'
import { PLAY_LOADING } from '@/declarations/play'
import { PLAY_LOADING_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayLoadingScreenProps {
  // Covers its parent instead of sitting in the flow
  isFill?: boolean
  // Covers the whole window, the page behind keeps waiting
  isCover?: boolean
}

/**
 * Loading screen of a game: Memora logo and progress bar
 * @param {PlayLoadingScreenProps} props - Placement
 * @return {JSX.Element}
 */

export const PlayLoadingScreen = ({ isFill, isCover }: PlayLoadingScreenProps) => {
  const progress = Math.round(usePlayLoadingProgress())

  return (
    <div
      className={cn(
        PLAY_LOADING_STYLES.screen,
        isFill && PLAY_LOADING_STYLES.fill,
        isCover && PLAY_LOADING_STYLES.cover
      )}
    >
      <div className={PLAY_LOADING_STYLES.box} aria-busy="true">
        <Image
          src={APP_ASSETS.brain}
          alt=""
          width={80}
          height={80}
          className={PLAY_LOADING_STYLES.logo}
          priority
        />
        <p className={PLAY_LOADING_STYLES.title}>{PLAY_LOADING.title}</p>
        <div
          role="progressbar"
          aria-label={PLAY_LOADING.title}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className={PLAY_LOADING_STYLES.track}
        >
          <div className={PLAY_LOADING_STYLES.bar} style={{ width: `${progress}%` }} />
        </div>
        <p className={PLAY_LOADING_STYLES.hint}>{PLAY_LOADING.hint}</p>
      </div>
    </div>
  )
}
