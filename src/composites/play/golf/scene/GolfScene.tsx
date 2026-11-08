'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'

import { GolfBalls } from '@/composites/play/golf/scene/ball/GolfBalls'
import { GolfCameraRig } from '@/composites/play/golf/scene/camera/GolfCameraRig'
import { GolfConfetti } from '@/composites/play/golf/scene/ball/GolfConfetti'
import { GolfControls } from '@/composites/play/golf/scene/camera/GolfControls'
import { GolfCourse } from '@/composites/play/golf/scene/course/GolfCourse'
import { GolfCupCheer } from '@/composites/play/golf/scene/ball/GolfCupCheer'
import { GolfDecorCubes } from '@/composites/play/golf/scene/decor/GolfDecorCubes'
import { GolfFixtures } from '@/composites/play/golf/scene/decor/GolfFixtures'
import { GolfGridGlow } from '@/composites/play/golf/scene/decor/GolfGridGlow'
import { GolfGusts } from '@/composites/play/golf/scene/weather/GolfGusts'
import { GolfHitboxes } from '@/composites/play/golf/scene/course/GolfHitboxes'
import { courseMap, neighboursOf, takenRects } from '@/composites/play/golf/scene/course/map'
import { GolfNeighbours } from '@/composites/play/golf/scene/decor/GolfNeighbours'
import { GolfLowMist } from '@/composites/play/golf/scene/weather/GolfLowMist'
import { GolfMist } from '@/composites/play/golf/scene/weather/GolfMist'
import { GolfObstacles } from '@/composites/play/golf/scene/course/GolfObstacles'
import { GolfProbe } from '@/composites/play/golf/scene/course/GolfProbe'
import { GolfScenery } from '@/composites/play/golf/scene/decor/GolfScenery'
import { GolfMotionDriver } from '@/composites/play/golf/scene/ball/GolfMotionDriver'
import { GolfSpecks } from '@/composites/play/golf/scene/weather/GolfSpecks'
import { GolfStageTransition } from '@/composites/play/golf/scene/camera/GolfStageTransition'
import { GolfSun } from '@/composites/play/golf/scene/weather/GolfSun'
import { readPaint, seatColor } from '@/composites/play/golf/scene/decor/paint'
import type { GolfRig } from '@/composites/play/golf/scene/camera/rig'
import type { GolfFace } from '@/composites/play/golf/types'
import { activePowers, courseAt, floorHeight } from '@/core/lib/play/golf'
import { useGolfPrefsStore } from '@/core/store/play/golfPrefs'
import type {
  GolfBoardState,
  GolfHazard,
  GolfHole,
  GolfHoleLayout,
  GolfMotion,
  GolfPoint,
} from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { GolfThemeName } from '@/declarations/play/golf/themes'
import { GOLF_SCENE_UI } from '@/declarations/ui/variants'
import { GolfPowers } from '@/utils/constants/play'

const { camera, physics, render } = GOLF_SETTINGS

// Ice power laid, if any
const iceOf = (hazards: GolfHazard[]): GolfHazard | null =>
  hazards.find((hazard) => hazard.power === GolfPowers.Ice) ?? null
const { light, fog } = GOLF_SCENE

// Hole outside any map
const ORIGIN: GolfPoint = [0, 0]

export interface GolfSceneProps {
  board: GolfBoardState
  hole: GolfHole
  // Holes of the map, the played one at mapIndex
  mapHoles: GolfHoleLayout[]
  mapIndex: number
  mapKey: string
  coursePaint: string
  theme: GolfThemeName
  faces: GolfFace[]
  viewerId: string
  focusId: string | null
  motionRef: RefObject<GolfMotion>
  rigRef: RefObject<GolfRig>
  // Hole open, own ball still to play
  canShoot: boolean
  // Power being placed, its reach
  placeRadius: number | null
  // Teleporter square half side
  placeSquare: number | null
  canPlace: (x: number, z: number) => boolean
  // Server minus local clock
  serverOffset: number
  onShoot: (angle: number, power: number) => void
  onPlace: (x: number, z: number) => void
  onCancel: () => void
  onOverview: () => void
  // Admin free view: hitboxes and the ground spot looked at
  isInspecting?: boolean
  onProbe?: (spot: [number, number] | null) => void
}

/**
 * The course in 3D: lights, ground, hole, fixtures, balls, gestures and camera
 * @param {GolfSceneProps} props - Board and handlers
 * @return {JSX.Element}
 */

const GolfScene = ({
  board,
  hole,
  mapHoles,
  mapIndex,
  mapKey,
  coursePaint,
  theme,
  faces,
  viewerId,
  focusId,
  motionRef,
  rigRef,
  canShoot,
  placeRadius,
  placeSquare,
  serverOffset,
  isInspecting = false,
  onProbe,
  ...handlers
}: GolfSceneProps) => {
  const paint = useMemo(() => readPaint(coursePaint), [coursePaint])
  // Modest phones draw lighter
  const [isSlow] = useState(() => navigator.hardwareConcurrency <= render.liteCores)
  const [isReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  // Dev wireframes on a query flag
  const [hasHitboxes] = useState(
    () =>
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).has(GOLF_SCENE.hitbox.query)
  )
  const { showPlayers, hasMist, hasSpecks, isLight } = useGolfPrefsStore()
  const isLite = isSlow || isLight
  // Bumped to draw a fresh canvas after a lost graphics context
  const [epoch, setEpoch] = useState(0)
  const lawn = useRef<Group>(null)
  const serverNow = useCallback(() => Date.now() + serverOffset, [serverOffset])
  const seatOf = useCallback(
    (accountId: string) => faces.find((face) => face.accountId === accountId)?.color ?? '',
    [faces]
  )
  const clock = useCallback(
    () => (serverNow() - board.startsAt) / 1000,
    [serverNow, board.startsAt]
  )
  const origin = courseMap(mapHoles)[mapIndex] ?? ORIGIN
  const neighbours = useMemo(() => neighboursOf(mapHoles, mapIndex), [mapHoles, mapIndex])
  const taken = useMemo(() => takenRects(neighbours), [neighbours])
  // Tee of the next hole when it stands on this map
  const nextTee = useMemo(() => {
    const isSameMap =
      board.hole + 1 < board.holes && courseAt(board.settings, board.hole + 1) === mapKey
    const next = isSameMap ? neighbours.find(({ rank }) => rank === mapIndex + 1) : undefined
    if (!next) return null
    const [tx, tz] = next.hole.tee
    const floor = floorHeight(next.hole, tx, tz) ?? 0

    return { x: next.at[0] + tx, y: floor + physics.ballRadius, z: next.at[1] + tz }
  }, [board.hole, board.holes, board.settings, mapKey, mapIndex, neighbours])
  const me = board.players.find((player) => player.accountId === viewerId)
  const myColor = useMemo(() => seatColor(seatOf(viewerId)), [seatOf, viewerId])
  const myPowers = () => activePowers(me?.effects ?? [], serverNow())
  const myId = me ? viewerId : null
  // Hole open and the own ball at rest
  const canShootNow = () =>
    canShoot &&
    Boolean(me) &&
    !motionRef.current.tracks.has(viewerId) &&
    serverNow() >= (me?.restsAt ?? 0) - GOLF_SETTINGS.restToleranceMs

  return (
    <Canvas
      key={`${isLite}-${epoch}`}
      onCreated={({ gl }) => {
        // Lost context stays blank, so redraw on a new canvas
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          setEpoch((value) => value + 1)
        })
      }}
      className={GOLF_SCENE_UI.canvas}
      dpr={[1, isLite ? render.liteDpr : render.maxDpr]}
      shadows={isLite ? false : 'soft'}
      gl={{ antialias: !isLite, powerPreference: 'high-performance' }}
      camera={{ fov: camera.fov, near: 0.1, far: fog.far * 2 }}
    >
      <color attach="background" args={[paint.horizon]} />
      <fog attach="fog" args={[paint.horizon, fog.near, fog.far]} />
      <hemisphereLight args={[paint.sky, paint.side, light.hemisphere]} />
      <GolfSun hole={hole} hasShadows={!isLite} />
      <GolfScenery hole={hole} paint={paint} theme={theme} taken={taken} />
      <GolfDecorCubes hole={hole} paint={paint} taken={taken} />
      {hasMist && (
        <>
          <GolfMist hole={hole} paint={paint} />
          <GolfLowMist hole={hole} paint={paint} />
        </>
      )}

      <GolfCourse
        hole={hole}
        paint={paint}
        lawnRef={lawn}
        ice={iceOf(board.hazards)}
        serverNow={serverNow}
      />
      <GolfNeighbours neighbours={neighbours} paint={paint} clock={clock} />
      {hasSpecks && <GolfSpecks hole={hole} paint={paint} />}
      <GolfFixtures
        hole={hole}
        paint={paint}
        motionRef={motionRef}
        serverNow={serverNow}
        startsAt={board.startsAt}
        takenOrbs={board.orbs}
        hazards={board.hazards}
        seatOf={seatOf}
        faceOf={(accountId) => faces.find((face) => face.accountId === accountId)}
      />
      <GolfObstacles hole={hole} paint={paint} clock={clock} motionRef={motionRef} />
      {isInspecting && onProbe && <GolfProbe lawn={lawn} onProbe={onProbe} />}
      {(hasHitboxes || isInspecting) && (
        <GolfHitboxes hole={hole} hazards={board.hazards} paint={paint} serverNow={serverNow} />
      )}
      <GolfGusts hole={hole} paint={paint} hazards={board.hazards} serverNow={serverNow} />
      <GolfBalls
        isFrozen={Boolean(iceOf(board.hazards))}
        players={board.players}
        faces={faces}
        viewerId={viewerId}
        focusId={focusId}
        showPlayers={showPlayers}
        hole={hole}
        motionRef={motionRef}
        rigRef={rigRef}
        paint={paint}
        serverNow={serverNow}
      />
      <GolfGridGlow
        players={board.players}
        viewerId={viewerId}
        motionRef={motionRef}
        rigRef={rigRef}
        origin={origin}
        isStill={isReduced}
      />
      <GolfStageTransition
        rigRef={rigRef}
        closedAt={board.closedAt}
        serverNow={serverNow}
        playerIds={board.players
          .filter((player) => !player.hasLeft)
          .map((player) => player.accountId)}
        nextTee={nextTee}
        isLast={board.hole + 1 >= board.holes}
      />
      <GolfMotionDriver motionRef={motionRef} players={board.players} viewerId={viewerId} />
      <GolfConfetti hole={hole} paint={paint} motionRef={motionRef} />
      <GolfCupCheer hole={hole} faces={faces} paint={paint} />
      <GolfControls
        isFrozen={Boolean(iceOf(board.hazards))}
        hole={hole}
        paint={paint}
        color={myColor}
        powers={myPowers}
        rigRef={rigRef}
        lawn={lawn}
        myId={myId}
        canShoot={canShootNow}
        isPlacing={placeRadius !== null}
        placeRadius={placeRadius ?? 0}
        placeSquare={placeSquare}
        {...handlers}
      />
      <GolfCameraRig
        rigRef={rigRef}
        hole={hole}
        focusId={focusId}
        map={mapKey}
        origin={origin}
        taken={taken}
      />
    </Canvas>
  )
}

export default GolfScene
