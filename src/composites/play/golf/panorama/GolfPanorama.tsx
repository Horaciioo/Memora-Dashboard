'use client'

import dynamic from 'next/dynamic'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'

import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_PANORAMA } from '@/declarations/ui/variants'

const { panorama } = GOLF_SCENE

// Three loaded only on the golf hub
const GolfPanoramaScene = dynamic(
  () => import('@/composites/play/golf/panorama/GolfPanoramaScene'),
  { ssr: false }
)

/**
 * Blurred map from above, a new course fading in every few seconds or the one held
 * @param {Object} props - Panorama
 * @param {string} [props.course] - Course to hold, none cycles
 * @return {JSX.Element}
 */

export const GolfPanorama = ({ course: held }: { course?: string }) => {
  // Newest layer last, the one before leaves once covered
  const [layers, setLayers] = useState([{ id: 0, course: held ?? GOLF_COURSES.keys[0] }])

  // Held course fades in over the last
  if (held && held !== layers[layers.length - 1].course) {
    setLayers((current) => [
      ...current.slice(-1),
      { id: current[current.length - 1].id + 1, course: held },
    ])
  }

  // Next course over the last
  useEffect(() => {
    if (held) return
    const tick = setInterval(
      () =>
        setLayers((current) => {
          const id = current[current.length - 1].id + 1

          return [
            ...current.slice(-1),
            { id, course: GOLF_COURSES.keys[id % GOLF_COURSES.keys.length] },
          ]
        }),
      panorama.seconds * 1000
    )

    return () => clearInterval(tick)
  }, [held])

  // Old layer dropped once the new one is opaque
  useEffect(() => {
    if (layers.length < 2) return
    const drop = setTimeout(() => setLayers((current) => current.slice(-1)), panorama.fadeMs + 200)

    return () => clearTimeout(drop)
  }, [layers])

  return (
    <div className={GOLF_PANORAMA.root} aria-hidden="true">
      <div className={GOLF_PANORAMA.stage}>
        {layers.map(({ id, course }) => (
          <div
            key={id}
            className={GOLF_PANORAMA.layer}
            style={{ '--panorama-fade': `${panorama.fadeMs}ms` } as CSSProperties}
          >
            <GolfPanoramaScene course={course} />
          </div>
        ))}
      </div>
      <div className={GOLF_PANORAMA.mist} />
      <div className={GOLF_PANORAMA.scrim} />
    </div>
  )
}
