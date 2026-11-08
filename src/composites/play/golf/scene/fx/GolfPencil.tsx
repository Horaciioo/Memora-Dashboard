'use client'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { eraser } = GOLF_SCENE

/**
 * Small pencil with its rubber down, wiping a blind aim
 * @param {Object} props - Colours
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfPencil = ({ paint }: { paint: GolfPaint }) => (
  <group position={[0, eraser.lift, 0]} rotation={[eraser.tilt, 0, 0]}>
    <mesh position={[0, eraser.size / 2, 0]}>
      <cylinderGeometry
        args={[eraser.size * eraser.radius, eraser.size * eraser.radius, eraser.size, 6]}
      />
      <meshToonMaterial color={paint.place} />
    </mesh>
    <mesh position={[0, eraser.size * (1 + eraser.tip / 2), 0]}>
      <coneGeometry args={[eraser.size * eraser.radius, eraser.size * eraser.tip, 6]} />
      <meshToonMaterial color={paint.trunk} />
    </mesh>
    <mesh position={[0, -eraser.size * eraser.rubber * 0.5, 0]}>
      <cylinderGeometry
        args={[
          eraser.size * eraser.radius,
          eraser.size * eraser.radius,
          eraser.size * eraser.rubber,
          6,
        ]}
      />
      <meshToonMaterial color={paint.bad} />
    </mesh>
  </group>
)
