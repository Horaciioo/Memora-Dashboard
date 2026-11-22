'use client'

import { useEffect, useRef } from 'react'

import { ConcordatGlyph } from '@/composites/play/concordat/hud/ConcordatGlyph'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'

// Half of the ghost side in pixels, centres it on the pointer
const HALF = 24

/**
 * Pictogram of the armed tool, it follows the pointer until it is set down
 * @return {JSX.Element | null}
 */

export const ConcordatToolGhost = () => {
  const tool = useConcordatViewStore((state) => state.tool)
  const node = useRef<HTMLDivElement>(null)
  const spot = useRef({ x: -100, y: -100 })

  // Move without a render
  useEffect(() => {
    const place = () => {
      if (node.current) {
        node.current.style.transform = `translate(${spot.current.x - HALF}px, ${spot.current.y - HALF}px)`
      }
    }
    const onMove = (event: PointerEvent) => {
      spot.current = { x: event.clientX, y: event.clientY }
      place()
    }
    place()
    window.addEventListener('pointermove', onMove)

    return () => window.removeEventListener('pointermove', onMove)
  }, [tool])

  if (!tool) return null

  return (
    <div ref={node} className={CONCORDAT_HUD.ghost} aria-hidden="true">
      <ConcordatGlyph
        kind={
          tool.kind === 'build'
            ? tool.building
            : tool.kind === 'fleet'
              ? 'warship'
              : tool.kind === 'sortie'
                ? tool.air
                : (tool.weapon ?? (tool.isHeavy ? 'heavy' : 'missile'))
        }
        size={32}
      />
    </div>
  )
}
