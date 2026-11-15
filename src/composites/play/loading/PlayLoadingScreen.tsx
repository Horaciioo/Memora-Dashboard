'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ComponentType, CSSProperties } from 'react'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayLoadCurtain } from '@/composites/play/loading/PlayLoadCurtain'
import { usePlayLoadingProgress } from '@/core/hooks/interaction/state/play/usePlayLoadingProgress'
import { APP_ASSETS } from '@/declarations/app'
import { PLAY_GAMES, PLAY_LOADING, PLAY_LOADING_TIPS_DEFAULT } from '@/declarations/play'
import { PLAY_LOADING_STYLES } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayLoadingScreenProps {
  // Covers its parent instead of the window
  isFill?: boolean
  // Game dressing the screen
  game?: PlayGameName | null
  // Animated scene of the game, its logo when absent
  Scene?: ComponentType
  // Tips of the game, the shared ones when absent
  tips?: readonly string[]
  // Real progress, the bar eases on its own when absent
  percent?: number
  // Game loaded: the squares leave
  isDone?: boolean
  // Chat column stays visible beside the screen
  hasChat?: boolean
  // Already covering when it mounts, no squares entrance
  isInstant?: boolean
  onExited?: () => void
}

// What a game's own loading receives, the dressing is its job
export type PlayLoadingProps = Omit<PlayLoadingScreenProps, 'Scene' | 'tips'>

/**
 * Shared frame of a loading screen: squares cover the window
 * @param {PlayLoadingScreenProps} props - Placement, game, dressing and progress
 * @return {JSX.Element | null}
 */

export const PlayLoadingScreen = ({
  isFill,
  game,
  Scene,
  tips = PLAY_LOADING_TIPS_DEFAULT,
  percent,
  isDone,
  hasChat,
  isInstant,
  onExited,
}: PlayLoadingScreenProps) => {
  const eased = usePlayLoadingProgress()
  const progress = Math.round(isDone ? 100 : (percent ?? eased))
  const shown = game ?? null
  const meta = shown ? PLAY_GAMES.get(shown) : null
  const tone = meta?.tone ?? '--play-golf'
  const [tipAt, setTipAt] = useState(0)
  const [isGone, setGone] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setTipAt((now) => now + 1), PLAY_LOADING.tipMs)

    return () => window.clearInterval(timer)
  }, [])

  // Once the squares have left the screen is removed
  useEffect(() => {
    if (!isDone) return
    const timer = window.setTimeout(
      () => {
        setGone(true)
        onExited?.()
      },
      2 * PLAY_LOADING.curtain.waveMs + PLAY_LOADING.curtain.popMs + PLAY_LOADING.curtain.exitPadMs
    )

    return () => window.clearTimeout(timer)
  }, [isDone, onExited])

  if (isGone) return null

  return (
    <div
      className={cn(
        PLAY_LOADING_STYLES.screen,
        isFill && PLAY_LOADING_STYLES.fill,
        hasChat && PLAY_LOADING_STYLES.beside,
        isDone && 'pointer-events-none'
      )}
      style={
        {
          '--play-loading-square': `var(${tone}-deep)`,
          '--play-loading-tone': `var(${tone}-glow)`,
        } as CSSProperties
      }
      aria-busy={!isDone}
    >
      <PlayLoadCurtain isOpen={Boolean(isDone)} isInstant={Boolean(isInstant)} />

      <div className={cn(PLAY_LOADING_STYLES.content, isDone && PLAY_LOADING_STYLES.contentOut)}>
        <span
          className={PLAY_LOADING_STYLES.glow}
          style={{ background: 'var(--play-loading-tone)' }}
        />

        <div className={PLAY_LOADING_STYLES.brand}>
          <Image
            src={APP_ASSETS.brain}
            alt=""
            width={28}
            height={28}
            className={PLAY_LOADING_STYLES.brandLogo}
            priority
          />
          {PLAY_LOADING.brand}
        </div>

        <div className={PLAY_LOADING_STYLES.stage}>
          {Scene ? (
            <Scene />
          ) : shown ? (
            <PlayGameLogo game={shown} className={PLAY_LOADING_STYLES.logo} />
          ) : (
            <Image
              src={APP_ASSETS.brain}
              alt=""
              width={144}
              height={144}
              className={PLAY_LOADING_STYLES.mystery}
              priority
            />
          )}
          <h1 className={PLAY_LOADING_STYLES.name}>{meta?.label ?? PLAY_LOADING.title}</h1>
        </div>

        <div className={PLAY_LOADING_STYLES.footer}>
          <Image
            src={APP_ASSETS.brain}
            alt=""
            width={40}
            height={40}
            className={PLAY_LOADING_STYLES.memora}
          />
          <div className={PLAY_LOADING_STYLES.meter}>
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
            <span className={PLAY_LOADING_STYLES.percent}>{progress}%</span>
          </div>
          <p className={PLAY_LOADING_STYLES.tip} role="status" key={tipAt % tips.length}>
            {tips[tipAt % tips.length]}
          </p>
        </div>
      </div>
    </div>
  )
}
