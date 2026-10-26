'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Group, Mesh } from 'three'

import { avatarTexture } from '@/composites/play/golf/scene/avatarTexture'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { seatColor } from '@/composites/play/golf/scene/paint'
import { dropLift, eventScale } from '@/composites/play/golf/scene/ballPop'
import { GolfFlashSwarm } from '@/composites/play/golf/scene/GolfFlashSwarm'
import { GolfTrail } from '@/composites/play/golf/scene/GolfTrail'
import { rollBall } from '@/composites/play/golf/scene/roll'
import { ballTexture } from '@/composites/play/golf/scene/textures'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import type { GolfFace } from '@/composites/play/golf/types'
import { activePowers, ballScale, floorHeight, reachedEvent, trackSpot } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion, GolfPlayerState } from '@/core/lib/play/golf'
import { useGolfPrefsStore } from '@/core/store/golfPrefs'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { physics } = GOLF_SETTINGS
const { ball, sink, avatar, stack } = GOLF_SCENE

export interface GolfBallProps {
  player: GolfPlayerState
  face: GolfFace | undefined
  hole: GolfHole
  motionRef: RefObject<GolfMotion>
  rigRef: RefObject<GolfRig>
  paint: GolfPaint
  isMine: boolean
  serverNow: () => number
  // Order it fell in, for its resting spot in the cup
  seat: number
  // False once every player has holed and the cup can empty
  isWaiting: boolean
  // Drawn at all, hidden others stay out of sight
  isShown: boolean
  // More than one player, avatars show
  isCrowd: boolean
}

/**
 * Resting spot of a holed ball inside the cup, one per arrival order
 * @param {number} seat - Order it fell in
 * @return {[number, number, number]} - Offset from the cup centre
 */

const stackSpot = (seat: number): [number, number, number] => {
  const angle = seat * 2.4
  const radius = Math.min(seat, 3) * stack.jitter
  return [Math.cos(angle) * radius, seat * stack.gap, Math.sin(angle) * radius]
}

/**
 * Places a holed ball at its stacked resting spot, popping it away once free
 * @param {Object} args - Ball refs and timing
 * @return {void}
 */

const applyCupRest = ({
  body,
  roller,
  shield,
  last,
  restedAt,
  spots,
  id,
  hole,
  seat,
  isWaiting,
  hasLeft,
  now,
}: {
  body: Group
  roller: Mesh | null
  shield: Mesh | null
  last: RefObject<Vector3 | null>
  restedAt: RefObject<number | null>
  spots: Map<string, Vector3>
  id: string
  hole: GolfHole
  seat: number
  isWaiting: boolean
  hasLeft: boolean
  now: number
}): void => {
  restedAt.current ??= now
  const cupFloor = floorHeight(hole, hole.cup[0], hole.cup[1]) ?? 0
  const [ox, oy, oz] = stackSpot(seat)
  const since = isWaiting ? 0 : now - restedAt.current
  const pop = Math.min(1, since / stack.popMs)
  body.position.set(
    hole.cup[0] + ox,
    cupFloor - sink.depth + physics.ballRadius + oy + pop * sink.depth * 2,
    hole.cup[1] + oz
  )
  body.scale.setScalar(Math.max(1 - pop, 1e-3))
  body.visible = !hasLeft && pop < 1
  if (shield) shield.visible = false
  if (roller) rollBall(roller, last, body.position, 1)
  spots.set(id, (spots.get(id) ?? new Vector3()).copy(body.position))
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
  seat,
  isWaiting,
  isShown,
  isCrowd,
}: GolfBallProps) => {
  const hasTrails = useGolfPrefsStore((state) => state.hasTrails)
  const body = useRef<Group>(null)
  const roller = useRef<Mesh>(null)
  const shield = useRef<Mesh>(null)
  const last = useRef<Vector3 | null>(null)
  const depth = useRef(0)
  const restedAt = useRef<number | null>(null)
  const shownAt = useRef(0)
  const color = useMemo(() => seatColor(face?.color ?? ''), [face?.color])
  const skin = useMemo(() => ballTexture(color, paint.pole), [color, paint.pole])
  const tag = useMemo(
    () =>
      face && isCrowd
        ? avatarTexture({
            name: face.name,
            url: face.avatarUrl,
            color,
            shade: paint.shade,
            pixels: avatar.pixels,
            ring: avatar.ring,
          })
        : null,
    [face, isCrowd, color, paint.shade]
  )
  useEffect(() => () => tag?.dispose(), [tag])
  useEffect(() => () => skin.dispose(), [skin])
  // Falls on each new hole
  useEffect(() => {
    shownAt.current = performance.now()
  }, [hole])
  const id = player.accountId

  useFrame((_, delta) => {
    if (!body.current) return
    const now = performance.now()
    const track = motionRef.current.tracks.get(id)
    const restsInCup = player.isHoled && !track

    if (restsInCup) {
      applyCupRest({
        body: body.current,
        roller: roller.current,
        shield: shield.current,
        last,
        restedAt,
        spots: rigRef.current.spots,
        id,
        hole,
        seat,
        isWaiting,
        hasLeft: player.hasLeft || !isShown,
        now,
      })
      return
    }

    restedAt.current = null
    const spot = track
      ? trackSpot(track, now)
      : { x: player.x, y: floorHeight(hole, player.x, player.z) ?? 0, z: player.z }
    const powers = activePowers(player.effects, serverNow())
    const scale = ballScale(powers)
    const drawn = scale * eventScale(track, id, now)

    // Sinks in the cup or the water
    const isSinking = Boolean(track && reachedEvent(track, id, ['cup', 'splash'], now))
    depth.current = isSinking ? Math.min(sink.depth, depth.current + sink.speed * delta) : 0
    const center =
      spot.y + physics.ballRadius * drawn - depth.current + dropLift(now - shownAt.current)
    body.current.position.set(spot.x, center, spot.z)
    body.current.scale.setScalar(Math.max(drawn, 1e-3))
    body.current.visible = !player.hasLeft && isShown
    if (shield.current) shield.current.visible = powers.has(GolfPowers.AntiCollision)
    if (roller.current) rollBall(roller.current, last, body.current.position, scale)

    // Camera follows the drawn spot
    const { spots } = rigRef.current
    spots.set(id, (spots.get(id) ?? new Vector3()).set(spot.x, center, spot.z))
  })

  const isGhost = player.powers.includes(GolfPowers.Ghost)
  const isTeed = player.strokes === 0 && !isMine

  return (
    <>
      <group ref={body}>
        <mesh ref={roller} castShadow>
          <sphereGeometry args={[physics.ballRadius, ball.segments, ball.segments / 2]} />
          <meshStandardMaterial
            map={skin}
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
        {tag && (
          <sprite position={[0, avatar.lift, 0]} scale={[avatar.size, avatar.size, 1]}>
            <spriteMaterial map={tag} transparent depthWrite={false} />
          </sprite>
        )}
      </group>
      {isShown && hasTrails && <GolfTrail target={body} color={color} />}
      {isShown && <GolfFlashSwarm target={body} motionRef={motionRef} id={id} />}
    </>
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
  focusId,
  showPlayers,
  ...shared
}: Omit<
  GolfBallProps,
  'player' | 'face' | 'isMine' | 'seat' | 'isWaiting' | 'isShown' | 'isCrowd'
> & {
  players: GolfPlayerState[]
  faces: GolfFace[]
  viewerId: string
  focusId: string | null
  showPlayers: boolean
}) => {
  const active = players.filter((player) => !player.hasLeft)
  const isWaiting = active.some((player) => !player.isHoled)
  let nextSeat = 0

  return (
    <>
      {players.map((player) => (
        <GolfBall
          key={player.accountId}
          player={player}
          face={faces.find((face) => face.accountId === player.accountId)}
          isMine={player.accountId === viewerId}
          seat={player.isHoled ? nextSeat++ : 0}
          isWaiting={isWaiting}
          isCrowd={active.length > 1}
          isShown={showPlayers || player.accountId === viewerId || player.accountId === focusId}
          {...shared}
        />
      ))}
    </>
  )
}
