'use client'

import { useEffect, useMemo } from 'react'
import { BackSide, Color, Float32BufferAttribute, SphereGeometry } from 'three'

import { sceneryOf } from '@/composites/play/golf/scene/decor'
import type { GolfBlock } from '@/composites/play/golf/scene/decor'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_THEMES } from '@/declarations/play/golf/themes'
import type { GolfThemeName } from '@/declarations/play/golf/themes'

const { sky, stars } = GOLF_SCENE

/**
 * Sky dome, horizon band fading to the sky
 * @param {GolfPaint} paint - Colours
 * @return {SphereGeometry} - Dome
 */

const skyDome = (paint: GolfPaint): SphereGeometry => {
  const dome = new SphereGeometry(sky.radius, sky.segments, sky.segments / 2)
  const positions = dome.getAttribute('position')
  const shade = new Color()
  const colors: number[] = []
  for (let index = 0; index < positions.count; index += 1) {
    // Horizon on the equator, sky above and below
    const share = Math.abs(positions.getY(index) / sky.radius)
    shade.lerpColors(paint.horizon, paint.sky, Math.sqrt(share))
    colors.push(shade.r, shade.g, shade.b)
  }
  dome.setAttribute('color', new Float32BufferAttribute(colors, 3))

  return dome
}

/**
 * Plain straight block standing by the course, axis aligned, foot on the ground
 * @param {Object} props - Block
 * @param {GolfBlock} props.block - Layout
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

const Block = ({ block, paint }: { block: GolfBlock; paint: GolfPaint }) => {
  const tone = [paint.block, paint.side, paint.wall][block.tone] ?? paint.block

  return (
    <mesh
      position={[block.at[0], block.at[1] + block.height / 2, block.at[2]]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[block.width, block.height, block.depth]} />
      <meshStandardMaterial color={tone} flatShading />
    </mesh>
  )
}

/**
 * Stars scattered on the sky
 * @param {Object} props - Hole
 * @param {GolfHole} props.hole - Hole
 * @return {JSX.Element}
 */

const Stars = ({ hole }: { hole: GolfHole }) => {
  const positions = useMemo(() => {
    const random = seededRandom(holeSeed(hole))

    return new Float32Array(
      Array.from({ length: stars.count }, () => {
        // Upper half sphere
        const angle = random() * Math.PI * 2
        const lift = random() * 0.9 + 0.05
        const flat = Math.sqrt(1 - lift * lift)

        return [
          Math.cos(angle) * flat * sky.radius * stars.reach,
          lift * sky.radius * stars.reach,
          Math.sin(angle) * flat * sky.radius * stars.reach,
        ]
      }).flat()
    )
  }, [hole])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="white" size={stars.size} sizeAttenuation={false} fog={false} />
    </points>
  )
}

/**
 * Sky and floating islets around the course
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {GolfThemeName} props.theme - Map theme
 * @param {GolfHole['bounds'][]} props.taken - Other holes around
 * @return {JSX.Element}
 */

export const GolfScenery = ({
  hole,
  paint,
  theme,
  taken,
}: {
  hole: GolfHole
  paint: GolfPaint
  theme: GolfThemeName
  taken: GolfHole['bounds'][]
}) => {
  const { hasStars } = GOLF_THEMES[theme]
  const dome = useMemo(() => skyDome(paint), [paint])
  const scenery = useMemo(() => sceneryOf(hole, taken), [hole, taken])
  useEffect(() => () => dome.dispose(), [dome])

  return (
    <>
      <mesh geometry={dome}>
        <meshBasicMaterial vertexColors side={BackSide} fog={false} depthWrite={false} />
      </mesh>
      {hasStars && <Stars hole={hole} />}
      {scenery.blocks.map((block, index) => (
        <Block key={index} block={block} paint={paint} />
      ))}
    </>
  )
}
