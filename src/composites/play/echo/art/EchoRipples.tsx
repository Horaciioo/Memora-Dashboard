'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { ECHO_BANNER } from '@/declarations/play/echo/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

interface Ripple {
  id: number
  x: number
  y: number
}

/**
 * Sound rings born under the pointer as it walks the hub
 * @return {JSX.Element}
 */

export const EchoRipples = () => {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const last = useRef({ x: 0, y: 0, id: 0 })

  // Pointer walk, quiet under reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { step, life, max } = ECHO_BANNER.ripple
    const onMove = (event: PointerEvent) => {
      const walked = Math.hypot(event.clientX - last.current.x, event.clientY - last.current.y)
      if (walked < step) return
      const id = ++last.current.id
      last.current = { x: event.clientX, y: event.clientY, id }
      setRipples((list) => [...list.slice(1 - max), { id, x: event.clientX, y: event.clientY }])
      window.setTimeout(() => setRipples((list) => list.filter((ripple) => ripple.id !== id)), life)
    }
    window.addEventListener('pointermove', onMove)

    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className={PLAY_HUB.echoRipples} aria-hidden="true">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={PLAY_HUB.echoRipple}
          style={{ '--x': `${ripple.x}px`, '--y': `${ripple.y}px` } as CSSProperties}
        />
      ))}
    </div>
  )
}
