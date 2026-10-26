'use client'

import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

import { GolfPanoramaStage } from '@/composites/play/golf/panorama/GolfPanoramaStage'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETUP } from '@/declarations/ui/variants'

const { panorama, shot } = GOLF_SCENE

/**
 * Grabs the canvas once the course had its frames
 * @param {Object} props - Grab
 * @param {(url: string) => void} props.onShot - Receives the image
 * @return {null}
 */

const Grab = ({ onShot }: { onShot: (url: string) => void }) => {
  const [frames, setFrames] = useState(0)

  useFrame(({ gl }) => {
    if (frames > shot.frames) return
    setFrames(frames + 1)
    if (frames === shot.frames) onShot(gl.domElement.toDataURL('image/jpeg', shot.quality))
  })

  return null
}

/**
 * One hidden canvas drawing every course in turn, then leaving
 * @param {Object} props - Thumbnails
 * @param {string[]} props.missing - Courses without a thumbnail
 * @param {(course: string, url: string) => void} props.onShot - Receives an image
 * @return {JSX.Element | null}
 */

const GolfCourseShots = ({
  missing,
  onShot,
}: {
  missing: string[]
  onShot: (course: string, url: string) => void
}) => {
  const course = missing.find((key) => GOLF_COURSES.has(key))
  if (!course) return null

  return (
    <div
      className={GOLF_SETUP.shots}
      style={{ width: shot.width, height: shot.height }}
      aria-hidden="true"
    >
      <Canvas
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ fov: panorama.fov, near: 0.5 }}
      >
        <GolfPanoramaStage key={`stage-${course}`} course={course} isStill />
        <Grab key={`grab-${course}`} onShot={(url) => onShot(course, url)} />
      </Canvas>
    </div>
  )
}

export default GolfCourseShots
