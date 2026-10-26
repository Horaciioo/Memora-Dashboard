'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import { GolfNeighbours } from '@/composites/play/golf/scene/GolfNeighbours'
import { courseMap, neighboursOf } from '@/composites/play/golf/scene/map'
import { readPaint } from '@/composites/play/golf/scene/paint'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { panorama, light, sun } = GOLF_SCENE

// Seconds since the page opened
const clock = (): number => performance.now() / 1000

/**
 * Camera high over the whole map, swaying and pushing in slowly unless still
 * @param {Object} props - Framing
 * @param {Vector3} props.center - Middle of the map
 * @param {number} props.distance - Closest distance from the middle
 * @param {boolean} props.isStill - Fixed view
 * @return {null}
 */

const PanoramaCamera = ({
  center,
  distance,
  isStill,
}: {
  center: Vector3
  distance: number
  isStill: boolean
}) => {
  useFrame(({ camera, clock: time }) => {
    // Far plane follows the map size
    if (camera.far !== distance * panorama.far) {
      camera.far = distance * panorama.far
      camera.updateProjectionMatrix()
    }
    const seconds = isStill ? 0 : time.elapsedTime
    const yaw = panorama.yaw + Math.sin(seconds * panorama.swingSpeed) * panorama.swing
    // Eased push-in, from far to close
    const left = isStill
      ? 0
      : Math.max(0, 1 - seconds / (panorama.seconds + panorama.fadeMs / 1000))
    const reach = distance * (1 + panorama.push * left * left)
    camera.position.set(
      center.x + Math.sin(yaw) * Math.cos(panorama.pitch) * reach,
      Math.sin(panorama.pitch) * reach,
      center.z + Math.cos(yaw) * Math.cos(panorama.pitch) * reach
    )
    camera.lookAt(center)
  })

  return null
}

/**
 * Every hole of a course laid out side by side, lit and framed from above
 * @param {Object} props - Course
 * @param {string} props.course - Course key
 * @param {boolean} [props.isStill] - Fixed view
 * @return {JSX.Element}
 */

export const GolfPanoramaStage = ({
  course,
  isStill = false,
}: {
  course: string
  isStill?: boolean
}) => {
  const meta = GOLF_COURSES.get(course)
  const paint = useMemo(() => readPaint(meta.paint), [meta.paint])
  // Holes where the map puts them
  const holes = useMemo(() => neighboursOf(meta.holes, -1), [meta.holes])
  const { center, reach } = useMemo(() => {
    const origins = courseMap(meta.holes)
    const rects = holes.map(({ hole }, index) => ({
      x0: hole.bounds.x0 + origins[index][0],
      x1: hole.bounds.x1 + origins[index][0],
      z0: hole.bounds.z0 + origins[index][1],
      z1: hole.bounds.z1 + origins[index][1],
    }))
    const x0 = Math.min(...rects.map((rect) => rect.x0))
    const x1 = Math.max(...rects.map((rect) => rect.x1))
    const z0 = Math.min(...rects.map((rect) => rect.z0))
    const z1 = Math.max(...rects.map((rect) => rect.z1))

    return {
      center: new Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2),
      reach: Math.max(x1 - x0, z1 - z0),
    }
  }, [meta.holes, holes])
  const distance = (reach * panorama.zoom) / Math.tan((panorama.fov * Math.PI) / 360)

  return (
    <>
      <color attach="background" args={[paint.horizon]} />
      <fog
        attach="fog"
        args={[paint.horizon, distance * panorama.fogNear, distance * panorama.fogFar]}
      />
      <hemisphereLight args={[paint.sky, paint.side, light.hemisphere]} />
      <directionalLight
        position={[center.x + sun.offset[0], sun.offset[1], center.z + sun.offset[2]]}
        intensity={light.sun}
      />
      <GolfNeighbours neighbours={holes} paint={paint} clock={clock} />
      <PanoramaCamera center={center} distance={distance} isStill={isStill} />
    </>
  )
}
