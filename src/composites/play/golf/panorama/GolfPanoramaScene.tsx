'use client'

import { Canvas } from '@react-three/fiber'

import { GolfPanoramaStage } from '@/composites/play/golf/panorama/GolfPanoramaStage'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { panorama } = GOLF_SCENE

/**
 * Live panorama of one course, for the hub backdrop
 * @param {Object} props - Course
 * @param {string} props.course - Course key
 * @return {JSX.Element}
 */

const GolfPanoramaScene = ({ course }: { course: string }) => (
  <Canvas dpr={panorama.dpr} gl={{ antialias: false }} camera={{ fov: panorama.fov, near: 0.5 }}>
    <GolfPanoramaStage course={course} />
  </Canvas>
)

export default GolfPanoramaScene
