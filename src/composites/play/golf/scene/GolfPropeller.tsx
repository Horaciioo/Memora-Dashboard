'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Shape, ShapeGeometry } from 'three'
import type { Group } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { propeller } = GOLF_SCENE

/**
 * One petal blade along +x, drawn flat
 * @return {ShapeGeometry} - Geometry
 */

const bladeGeometry = (): ShapeGeometry => {
  const blade = new Shape()
  blade.moveTo(0.08, -0.05)
  blade.bezierCurveTo(0.3, -0.5, 0.95, -0.5, 1, -0.1)
  blade.bezierCurveTo(1, 0.16, 0.55, 0.32, 0.08, 0.12)
  blade.closePath()

  return new ShapeGeometry(blade, propeller.segments)
}

// Turn of each blade
const BLADES = Array.from({ length: propeller.blades }, (_, index) => ({
  index,
  turn: (index / propeller.blades) * Math.PI * 2,
}))

/**
 * Spinning flat ventilator: green translucent blades, orange outline, a ghost turn for speed
 * @param {Object} props - Ventilator
 * @param {[number, number, number]} props.position - Hub centre
 * @param {GolfPaint} props.paint - Colours
 * @param {number} [props.size] - Radius gain
 * @param {number} [props.direction] - Turn sign
 * @param {() => number} [props.presence] - Zero to one, grows and fades
 * @return {JSX.Element}
 */

export const GolfPropeller = ({
  position,
  paint,
  size = 1,
  direction = 1,
  presence,
}: {
  position: [number, number, number]
  paint: GolfPaint
  size?: number
  direction?: number
  presence?: () => number
}) => {
  const root = useRef<Group>(null)
  const turning = useRef<Group>(null)
  const ghost = useRef<Group>(null)
  const blade = useMemo(() => bladeGeometry(), [])
  useEffect(() => () => blade.dispose(), [blade])

  useFrame(({ clock }) => {
    const angle = clock.elapsedTime * propeller.spin * direction
    if (turning.current) turning.current.rotation.z = angle
    if (ghost.current) ghost.current.rotation.z = angle - propeller.ghostTurn * direction
    if (root.current && presence) root.current.scale.setScalar(Math.max(0.001, size * presence()))
  })

  return (
    <group ref={root} position={position} scale={size}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={propeller.radius}>
        {/* Outline under the blades */}
        <group scale={propeller.outline} position={[0, 0, -0.004]}>
          {BLADES.map(({ index, turn }) => (
            <mesh key={index} geometry={blade} rotation={[0, 0, turn]}>
              <meshBasicMaterial color={paint['propeller-edge']} side={DoubleSide} />
            </mesh>
          ))}
        </group>
        {/* Ghost turn */}
        <group ref={ghost} position={[0, 0, 0.002]}>
          {BLADES.map(({ index, turn }) => (
            <mesh key={index} geometry={blade} rotation={[0, 0, turn]}>
              <meshBasicMaterial
                color={paint.propeller}
                transparent
                opacity={propeller.ghost}
                side={DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
        <group ref={turning} position={[0, 0, 0.006]}>
          {BLADES.map(({ index, turn }) => (
            <mesh key={index} geometry={blade} rotation={[0, 0, turn]}>
              <meshBasicMaterial
                color={paint.propeller}
                transparent
                opacity={propeller.opacity}
                side={DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[propeller.hub / propeller.radius, 16]} />
          <meshBasicMaterial color={paint.frost} />
        </mesh>
      </group>
    </group>
  )
}
