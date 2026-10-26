'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'

import { GolfBalls } from '@/composites/play/golf/scene/GolfBalls'
import { GolfCameraRig } from '@/composites/play/golf/scene/GolfCameraRig'
import { GolfConfetti } from '@/composites/play/golf/scene/GolfConfetti'
import { GolfControls } from '@/composites/play/golf/scene/GolfControls'
import { GolfCourse } from '@/composites/play/golf/scene/GolfCourse'
import { GolfFixtures } from '@/composites/play/golf/scene/GolfFixtures'
import { GolfGusts } from '@/composites/play/golf/scene/GolfGusts'
import { courseMap, neighboursOf, takenRects } from '@/composites/play/golf/scene/map'
import { GolfNeighbours } from '@/composites/play/golf/scene/GolfNeighbours'
import { GolfMist } from '@/composites/play/golf/scene/GolfMist'
import { GolfObstacles } from '@/composites/play/golf/scene/GolfObstacles'
import { GolfScenery } from '@/composites/play/golf/scene/GolfScenery'
import { GolfMotionDriver } from '@/composites/play/golf/scene/GolfMotionDriver'
import { GolfSpecks } from '@/composites/play/golf/scene/GolfSpecks'
import { GolfSun } from '@/composites/play/golf/scene/GolfSun'
import { readPaint, seatColor } from '@/composites/play/golf/scene/paint'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import type { GolfFace } from '@/composites/play/golf/types'
import { activePowers } from '@/core/lib/play/golf'
import { useGolfPrefsStore } from '@/core/store/golfPrefs'
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

const { camera, render } = GOLF_SETTINGS

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
  // Server minus local clock
  serverOffset: number
  onShoot: (angle: number, power: number) => void
  onPlace: (x: number, z: number) => void
  onCancel: () => void
  onOverview: () => void
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
  serverOffset,
  ...handlers
}: GolfSceneProps) => {
  const paint = useMemo(() => readPaint(coursePaint), [coursePaint])
  // Modest phones draw lighter
  const [isSlow] = useState(() => navigator.hardwareConcurrency <= render.liteCores)
  const { showPlayers, hasMist, hasSpecks, isLight } = useGolfPrefsStore()
  const isLite = isSlow || isLight
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
      key={String(isLite)}
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
      {hasMist && <GolfMist hole={hole} paint={paint} />}

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
      />
      <GolfObstacles hole={hole} paint={paint} clock={clock} />
      <GolfGusts hole={hole} paint={paint} hazards={board.hazards} serverNow={serverNow} />
      <GolfBalls
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
      <GolfMotionDriver motionRef={motionRef} players={board.players} viewerId={viewerId} />
      <GolfConfetti hole={hole} paint={paint} motionRef={motionRef} />
      <GolfControls
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
        {...handlers}
      />
      <GolfCameraRig rigRef={rigRef} hole={hole} focusId={focusId} map={mapKey} origin={origin} />
    </Canvas>
  )
}

export default GolfScene
