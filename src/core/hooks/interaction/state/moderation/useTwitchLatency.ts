'use client'

import { type RefObject, useCallback, useEffect, useState } from 'react'

import { TWITCH_ENDPOINTS } from '@/declarations/platforms/twitch'
import { SECOND_MS } from '@/utils/constants/time'

// Latency refresh
const POLL_MS = 2 * SECOND_MS

interface TwitchPlayer {
  getPlaybackStats: () => { hlsLatencyBroadcaster?: number }
}

interface TwitchEmbed {
  Player: new (target: HTMLElement, options: Record<string, unknown>) => TwitchPlayer
}

declare global {
  interface Window {
    Twitch?: TwitchEmbed
  }
}

/**
 * Official embed script, loaded once
 * @return {Promise<TwitchEmbed>} - Twitch embed API
 */

const loadEmbed = (): Promise<TwitchEmbed> =>
  new Promise((resolve, reject) => {
    if (window.Twitch) return resolve(window.Twitch)
    const script = document.createElement('script')
    script.src = TWITCH_ENDPOINTS.playerScript
    script.async = true
    script.onload = () => (window.Twitch ? resolve(window.Twitch) : reject(new Error('embed')))
    script.onerror = () => reject(new Error('embed'))
    document.head.appendChild(script)
  })

/**
 * Mount the Twitch player of a channel and read how far behind the live it plays
 * @param {RefObject<HTMLElement | null>} target - Element that receives the player
 * @param {string | null} channel - Channel login
 * @return {{ lag: number | null, failed: boolean, round: number, reload: () => void }} - Delay and reload
 */

export const useTwitchLatency = (target: RefObject<HTMLElement | null>, channel: string | null) => {
  const [lag, setLag] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const [round, setRound] = useState(0)
  const reload = useCallback(() => {
    setFailed(false)
    setRound((value) => value + 1)
  }, [])

  useEffect(() => {
    const element = target.current
    if (!element || !channel) return
    let isActive = true
    let timer: number | undefined
    loadEmbed()
      .then((twitch) => {
        if (!isActive) return
        const player = new twitch.Player(element, {
          channel,
          parent: [window.location.hostname],
          muted: true,
          autoplay: true,
          width: '100%',
          height: '100%',
        })
        timer = window.setInterval(() => {
          const latency = player.getPlaybackStats().hlsLatencyBroadcaster
          setLag(typeof latency === 'number' && latency >= 0 ? latency : null)
        }, POLL_MS)
      })
      .catch(() => isActive && setFailed(true))

    return () => {
      isActive = false
      window.clearInterval(timer)
      element.replaceChildren()
      setLag(null)
    }
  }, [target, channel, round])

  return { lag, failed, round, reload }
}
