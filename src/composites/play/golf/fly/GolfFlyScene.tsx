'use client'

import { Canvas } from '@react-three/fiber'

import { GolfPanoramaStage } from '@/composites/play/golf/panorama/GolfPanoramaStage'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { panorama } = GOLF_SCENE

/**
 * Whole map of a course to fly over
 * @param {Object} props - Course
 * @param {string} props.course - Course key
 * @return {JSX.Element}
 */

const GolfFlyScene = ({ course }: { course: string }) => (
  <Canvas
    dpr={[1, GOLF_SETTINGS.render.maxDpr]}
    camera={{ fov: panorama.fov * 1.6, near: 0.1, far: 600 }}
  >
    <GolfPanoramaStage key={course} course={course} isFlying />
  </Canvas>
)

export default GolfFlyScene
