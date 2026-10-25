'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Group, Mesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { seatColor } from '@/composites/play/golf/scene/paint'
import { labelTexture } from '@/composites/play/golf/scene/textures'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import type { GolfFace } from '@/composites/play/golf/types'
import { activePowers, ballScale, floorHeight, reachedEvent, trackSpot } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion, GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { physics, render } = GOLF_SETTINGS
const { ball, sink, label } = GOLF_SCENE

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

export interface GolfBallProps {
  player: GolfPlayerState
  face: GolfFace | undefined
  hole: GolfHole
  motionRef: RefObject<GolfMotion>
  rigRef: RefObject<GolfRig>
  paint: GolfPaint
  isMine: boolean
  serverNow: () => number
}

/**
 * One ball, on its track while it rolls, sinking in the cup or the void
 * @param {GolfBallProps} props - Ball and course
 * @return {JSX.Element}
 */

const GolfBall = ({
  player,
  face,
  hole,
  motionRef,
  rigRef,
  paint,
  isMine,
  serverNow,
}: GolfBallProps) => {
  const body = useRef<Group>(null)
  const shield = useRef<Mesh>(null)
  const height = useRef<number | null>(null)
  const depth = useRef(0)
  const color = useMemo(() => seatColor(face?.color ?? ''), [face?.color])
  const tag = useMemo(
    () => (face && !isMine ? labelTexture(face.name, color, paint.shade, label) : null),
    [face, isMine, color, paint.shade]
  )
  useEffect(() => () => tag?.dispose(), [tag])
  const id = player.accountId

  useFrame((_, delta) => {
    if (!body.current) return
    const now = performance.now()
    const track = motionRef.current.tracks.get(id)
    const spot = track ? trackSpot(track, now) : player
    const powers = activePowers(player.effects, serverNow())
    const scale = ballScale(powers)

    // Sinks in the cup or the void
    const isSinking = Boolean(track && reachedEvent(track, id, ['cup', 'fall', 'splash'], now))
    depth.current = isSinking ? Math.min(sink.depth, depth.current + sink.speed * delta) : 0

    // Drops fall, climbs follow at once
    const floor = floorHeight(hole, spot.x, spot.z) ?? height.current ?? 0
    const resting = floor + physics.ballRadius * scale - depth.current
    const fall = render.fallSpeed * delta
    height.current =
      height.current === null || resting >= height.current - fall ? resting : height.current - fall
    body.current.position.set(spot.x, height.current, spot.z)
    body.current.scale.setScalar(scale)
    body.current.visible = !player.hasLeft && (!player.isHoled || Boolean(track))
    if (shield.current) shield.current.visible = powers.has(GolfPowers.AntiCollision)

    // Camera follows the drawn spot
    const { spots } = rigRef.current
    spots.set(id, (spots.get(id) ?? new Vector3()).set(spot.x, height.current, spot.z))
  })

  const isGhost = player.powers.includes(GolfPowers.Ghost)
  const isTeed = player.strokes === 0 && !isMine

  return (
    <group ref={body}>
      <mesh>
        <sphereGeometry args={[physics.ballRadius, ball.segments, ball.segments / 2]} />
        <meshStandardMaterial
          color={color}
          roughness={ball.roughness}
          transparent={isGhost || isTeed}
          opacity={isGhost ? ball.ghost : isTeed ? ball.tee : 1}
        />
      </mesh>
      <mesh ref={shield} visible={false}>
        <sphereGeometry
          args={[physics.ballRadius * ball.shield, ball.segments, ball.segments / 2]}
        />
        <meshBasicMaterial color={paint.ice} transparent opacity={ball.ghost} wireframe />
      </mesh>
      <mesh position={[0, -physics.ballRadius + ball.shadowLift, 0]} rotation={FLAT}>
        <circleGeometry args={[physics.ballRadius * ball.shadow, ball.segments]} />
        <meshBasicMaterial
          color={paint.shade}
          transparent
          opacity={ball.shadowOpacity}
          depthWrite={false}
        />
      </mesh>
      {tag && (
        <sprite
          position={[0, label.lift, 0]}
          scale={[(label.height3d * label.width) / label.height, label.height3d, 1]}
        >
          <spriteMaterial map={tag} transparent depthWrite={false} />
        </sprite>
      )}
    </group>
  )
}

/**
 * Every ball of the table
 * @param {Omit<GolfBallProps, 'player' | 'face' | 'isMine'> & Object} props - Balls and course
 * @return {JSX.Element}
 */

export const GolfBalls = ({
  players,
  faces,
  viewerId,
  ...shared
}: Omit<GolfBallProps, 'player' | 'face' | 'isMine'> & {
  players: GolfPlayerState[]
  faces: GolfFace[]
  viewerId: string
}) => (
  <>
    {players.map((player) => (
      <GolfBall
        key={player.accountId}
        player={player}
        face={faces.find((face) => face.accountId === player.accountId)}
        isMine={player.accountId === viewerId}
        {...shared}
      />
    ))}
  </>
)
