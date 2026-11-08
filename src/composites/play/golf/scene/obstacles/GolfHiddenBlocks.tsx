'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import { roundBlockGeometry } from '@/composites/play/golf/scene/obstacles/blocks'
import { useReveal } from '@/composites/play/golf/scene/obstacles/useReveal'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfBlock, GolfMotion } from '@/core/lib/play/golf'

// Rise of a revealed block, ms
const RISE_MS = 320

/**
 * Block that pops out of the unseen floor once a ball comes close
 * @param {Object} props - Block and colours
 * @param {GolfBlock} props.block - Hidden block
 * @param {GolfPaint} props.paint - Colours
 * @param {RefObject<GolfMotion>} props.motionRef - Ball tracks
 * @return {JSX.Element | null}
 */

const GolfHiddenBlock = ({
  block,
  paint,
  motionRef,
}: {
  block: GolfBlock
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
}) => {
  const isShown = useReveal(motionRef, block)
  const body = useRef<Group>(null)
  const shownAt = useRef<number | null>(null)
  const geometry = useMemo(() => roundBlockGeometry(block), [block])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (!body.current || !isShown) return
    shownAt.current ??= performance.now()
    const progress = Math.min(1, (performance.now() - shownAt.current) / RISE_MS)
    // Overshoot then settle
    const shifted = progress - 1
    body.current.scale.y = Math.max(1e-3, 1 + 2.4 * shifted ** 3 + 1.4 * shifted ** 2)
  })
  if (!isShown) return null

  return (
    <group ref={body} position={[0, block.corners[0], 0]}>
      <mesh geometry={geometry} position={[0, -block.corners[0], 0]} castShadow receiveShadow>
        <meshToonMaterial color={paint.obstacle} />
      </mesh>
    </group>
  )
}

/**
 * Hidden blocks of a hole
 * @param {Object} props - Hole and ball tracks
 * @param {GolfBlock[]} props.blocks - Blocks of the hole
 * @param {GolfPaint} props.paint - Colours
 * @param {RefObject<GolfMotion>} props.motionRef - Ball tracks
 * @return {JSX.Element}
 */

export const GolfHiddenBlocks = ({
  blocks,
  paint,
  motionRef,
}: {
  blocks: GolfBlock[]
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
}) => (
  <>
    {blocks
      .filter((block) => block.isHidden)
      .map((block) => (
        <GolfHiddenBlock
          key={`${block.x0}:${block.z0}`}
          block={block}
          paint={paint}
          motionRef={motionRef}
        />
      ))}
  </>
)
