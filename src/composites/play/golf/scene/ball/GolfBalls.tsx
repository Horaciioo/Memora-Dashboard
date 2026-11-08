'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'

import { avatarTexture } from '@/composites/play/golf/scene/ball/avatarTexture'
import { GolfBumper } from '@/composites/play/golf/scene/course/GolfBumper'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import { seatColor } from '@/composites/play/golf/scene/decor/paint'
import { dropLift, eventScale } from '@/composites/play/golf/scene/ball/ballPop'
import { GolfFlashSwarm } from '@/composites/play/golf/scene/ball/GolfFlashSwarm'
import { ballLook } from '@/composites/play/golf/scene/fx/ballLook'
import { GolfCastBurst } from '@/composites/play/golf/scene/fx/GolfCastBurst'
import { tickPowers } from '@/composites/play/golf/scene/fx/stage'
import type { GolfPowerClock } from '@/composites/play/golf/scene/fx/stage'
import { GolfRespawnWind } from '@/composites/play/golf/scene/weather/GolfRespawnWind'
import { lossOf, respawnAt } from '@/composites/play/golf/scene/ball/respawn'
import type { GolfLoss, GolfRespawnPose } from '@/composites/play/golf/scene/ball/respawn'
import { GolfTrail } from '@/composites/play/golf/scene/ball/GolfTrail'
import { applyCupRest } from '@/composites/play/golf/scene/ball/cupRest'
import { rollBall } from '@/composites/play/golf/scene/ball/roll'
import { stageBallSpot } from '@/composites/play/golf/scene/camera/stage'
import { playRespawnWhoosh, playGolfSound } from '@/composites/play/golf/sound'
import { ballTexture } from '@/composites/play/golf/scene/decor/textures'
import type { GolfRig } from '@/composites/play/golf/scene/camera/rig'
import type { GolfFace } from '@/composites/play/golf/types'
import { activePowers, floorHeight, trackSpot } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion, GolfPlayerState } from '@/core/lib/play/golf'
import { useGolfPrefsStore } from '@/core/store/play/golfPrefs'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { physics } = GOLF_SETTINGS
const { ball, avatar } = GOLF_SCENE

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
  // Rink laid, trails turn dark
  isFrozen: boolean
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
  isFrozen,
}: GolfBallProps) => {
  const hasTrails = useGolfPrefsStore((state) => state.hasTrails)
  const body = useRef<Group>(null)
  const roller = useRef<Mesh>(null)
  const shield = useRef<Mesh>(null)
  const last = useRef<Vector3 | null>(null)
  const loss = useRef<GolfLoss | null>(null)
  const pose = useRef<GolfRespawnPose | null>(null)
  const clock = useRef<GolfPowerClock>(new Map())
  const isFirst = useRef(true)
  const [isReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
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
  const isTeed = player.strokes === 0 && !isMine

  useFrame(() => {
    if (!body.current) return
    const now = performance.now()
    const track = motionRef.current.tracks.get(id)
    const restsInCup = player.isHoled && !track

    // End of the hole: hop, then fly to the next tee
    const { stage } = rigRef.current
    const from = stage?.from.get(id)
    if (stage && from) {
      const at = stageBallSpot(from, stage.to, stage.seconds, stage.ranks.get(id) ?? 0)
      body.current.position.set(at.x, at.y, at.z)
      body.current.visible = !player.hasLeft && isShown
      rigRef.current.spots.get(id)?.copy(body.current.position)
      return
    }

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
        at: player,
        seat,
        isWaiting,
        hasLeft: player.hasLeft || !isShown,
        now,
      })
      return
    }

    restedAt.current = null
    // Lost in the void or the water, it flies back
    const lost = lossOf(track, id, now)
    if (lost) loss.current = { at: now - lost.ageMs, from: lost.from, to: lost.to }
    const back = respawnAt(loss.current, now, isReduced)
    if (isShown && back?.phase !== pose.current?.phase) {
      if (back?.phase === 'drop') playRespawnWhoosh()
      if (back?.phase === 'bounce') playGolfSound('land')
    }
    pose.current = back
    const spot =
      back ??
      (lost
        ? lost.to
        : track
          ? trackSpot(track, now)
          : { x: player.x, y: floorHeight(hole, player.x, player.z) ?? 0, z: player.z })
    const powers = activePowers(player.effects, serverNow())
    tickPowers(clock.current, powers, now, isFirst.current)
    isFirst.current = false
    const look = ballLook(clock.current, now, isReduced)
    const scale = look.size
    const drawn = scale * (back ? back.grow : eventScale(track, id, now))
    const stretch = (back?.stretch ?? 1) * look.stretch

    const center = spot.y + physics.ballRadius * drawn * stretch + dropLift(now - shownAt.current)
    body.current.position.set(spot.x, center, spot.z)
    const size = Math.max(drawn, 1e-3)
    body.current.scale.set(size / Math.sqrt(stretch), size * stretch, size / Math.sqrt(stretch))
    body.current.visible = !player.hasLeft && isShown
    body.current.rotation.y = look.spin
    if (shield.current) {
      shield.current.visible = look.bubble > 0
      shield.current.scale.setScalar(Math.max(look.bubble, 1e-3))
      ;(shield.current.material as MeshBasicMaterial).opacity = ball.ghost * look.bubbleOpacity
    }
    if (roller.current) {
      rollBall(roller.current, last, body.current.position, scale)
      const skinMaterial = roller.current.material as MeshStandardMaterial
      const opacity = isTeed ? ball.tee : look.opacity
      if (skinMaterial.transparent !== opacity < 1) {
        skinMaterial.transparent = opacity < 1
        skinMaterial.needsUpdate = true
      }
      skinMaterial.opacity = opacity
    }

    // Camera follows the drawn spot
    const { spots } = rigRef.current
    spots.set(id, (spots.get(id) ?? new Vector3()).set(spot.x, center, spot.z))
  })

  // Ball turned into a bumper, hitbox scale kept by the group
  const bouncer = player.effects.find(
    (effect) =>
      (effect.power === GolfPowers.BumperMan || effect.power === GolfPowers.BoingBoing) &&
      player.powers.includes(effect.power)
  )

  return (
    <>
      <group ref={body}>
        {bouncer && (
          <group position={[0, -physics.ballRadius, 0]}>
            <GolfBumper
              id={id}
              radius={physics.ballRadius}
              height={physics.ballRadius * ball.bumperHeight}
              color={color}
              paint={paint}
              motionRef={motionRef}
              face={face}
              hearts={{
                lives: bouncer.lives ?? 0,
                ...(bouncer.power === GolfPowers.BumperMan
                  ? { max: GOLF_SETTINGS.powers.bumperMan.lives }
                  : { max: GOLF_SETTINGS.powers.boingBoing.bounces, icon: 'golfBoing' as const }),
              }}
            />
          </group>
        )}
        <mesh ref={roller} castShadow visible={!bouncer}>
          <sphereGeometry args={[physics.ballRadius, ball.segments, ball.segments / 2]} />
          <meshStandardMaterial
            map={skin}
            roughness={ball.roughness}
            transparent={isTeed}
            opacity={isTeed ? ball.tee : 1}
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
      {isShown && hasTrails && (
        <GolfTrail target={body} color={color} frozen={isFrozen ? paint['trail-frozen'] : null} />
      )}
      {isShown && <GolfFlashSwarm target={body} motionRef={motionRef} id={id} />}
      {isShown && <GolfRespawnWind poseRef={pose} paint={paint} />}
      {isShown && <GolfCastBurst target={body} clockRef={clock} paint={paint} />}
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
