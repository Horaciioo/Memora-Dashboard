'use client'

import { useEffect, useState } from 'react'

import { loadWorldPainters } from '@/composites/play/naval/world/load'
import { navalMapSize } from '@/declarations/play/naval/maps'
import { NAVAL_MAP_CARD } from '@/declarations/ui/variants/games/naval'

// Pixels of a drawn picture, sharp on a large card at twice the density
const PICTURE_PX = 400

// Pictures drawn once per page visit
const PICTURES = new Map<string, string>()
// Maps drawn one after the other, never in the same frame
let queue: Promise<void> = Promise.resolve()

/**
 * Picture of a map, painted off screen in its own turn, the painter fetched on first use
 * @param {string} id - Map key
 * @return {Promise<string>} - Image url
 */

const pictureOf = (id: string): Promise<string> => {
  const known = PICTURES.get(id)
  if (known) return Promise.resolve(known)
  const drawn = queue.then(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    const [{ paintMapScene }, painters] = await Promise.all([
      import('@/composites/play/naval/world/scene'),
      loadWorldPainters(id),
    ])
    const canvas = document.createElement('canvas')
    canvas.width = PICTURE_PX
    canvas.height = PICTURE_PX
    paintMapScene(canvas, id, painters)
    PICTURES.set(id, canvas.toDataURL('image/webp', 0.9))
  })
  queue = drawn

  return drawn.then(() => PICTURES.get(id) ?? '')
}

/**
 * Face of a map card: its drawn picture and its size
 * @param {Object} props - Map
 * @param {string} props.id - Map key
 * @return {JSX.Element}
 */

export const NavalMapFace = ({ id }: { id: string }) => {
  const [url, setUrl] = useState(() => PICTURES.get(id) ?? null)
  useEffect(() => {
    let isLive = true
    if (!url) void pictureOf(id).then((drawn) => isLive && setUrl(drawn))

    return () => {
      isLive = false
    }
  }, [id, url])

  return (
    <>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={NAVAL_MAP_CARD.shot} />
      ) : (
        <span className={NAVAL_MAP_CARD.pending} />
      )}
      <span className={NAVAL_MAP_CARD.size}>{navalMapSize(id)}</span>
    </>
  )
}
