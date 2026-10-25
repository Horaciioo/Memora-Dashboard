'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'

import { GolfBalls } from '@/composites/play/golf/scene/GolfBalls'
import { GolfCameraRig } from '@/composites/play/golf/scene/GolfCameraRig'
import { GolfControls } from '@/composites/play/golf/scene/GolfControls'
import { GolfCourse } from '@/composites/play/golf/scene/GolfCourse'
import { GolfFixtures } from '@/composites/play/golf/scene/GolfFixtures'
import { GolfMist } from '@/composites/play/golf/scene/GolfMist'
import { GolfMotionDriver } from '@/composites/play/golf/scene/GolfMotionDriver'
import { GolfSpecks } from '@/composites/play/golf/scene/GolfSpecks'
import { readPaint } from '@/composites/play/golf/scene/paint'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import type { GolfFace } from '@/composites/play/golf/types'
import type { GolfBoardState, GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GOLF_SCENE_UI } from '@/declarations/ui/variants'

const { camera, render } = GOLF_SETTINGS
const { light, fog } = GOLF_SCENE

export interface GolfSceneProps {
  board: GolfBoardState
  hole: GolfHole
  coursePaint: string
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
  coursePaint,
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
  const [isLite] = useState(() => navigator.hardwareConcurrency <= render.liteCores)
  const lawn = useRef<Group>(null)
  const serverNow = useCallback(() => Date.now() + serverOffset, [serverOffset])
  const seatOf = useCallback(
    (accountId: string) => faces.find((face) => face.accountId === accountId)?.color ?? '',
    [faces]
  )
  const me = board.players.find((player) => player.accountId === viewerId)
  const myId = me ? viewerId : null
  // Hole open and the own ball at rest
  const canShootNow = () =>
    canShoot &&
    Boolean(me) &&
    !motionRef.current.tracks.has(viewerId) &&
    serverNow() >= (me?.restsAt ?? 0) - GOLF_SETTINGS.restToleranceMs

  return (
    <Canvas
      className={GOLF_SCENE_UI.canvas}
      dpr={[1, isLite ? render.liteDpr : render.maxDpr]}
      gl={{ antialias: !isLite, powerPreference: 'high-performance' }}
      camera={{ fov: camera.fov, near: 0.1, far: fog.far * 2 }}
    >
      <color attach="background" args={[paint.horizon]} />
      <fog attach="fog" args={[paint.horizon, fog.near, fog.far]} />
      <hemisphereLight args={[paint.sky, paint.side, light.hemisphere]} />
      <directionalLight position={[...light.sunPosition]} intensity={light.sun} />
      <GolfMist hole={hole} paint={paint} />

      <GolfCourse hole={hole} paint={paint} lawnRef={lawn} />
      <GolfSpecks hole={hole} paint={paint} />
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
      <GolfBalls
        players={board.players}
        faces={faces}
        viewerId={viewerId}
        hole={hole}
        motionRef={motionRef}
        rigRef={rigRef}
        paint={paint}
        serverNow={serverNow}
      />
      <GolfMotionDriver motionRef={motionRef} players={board.players} />
      <GolfControls
        hole={hole}
        paint={paint}
        rigRef={rigRef}
        lawn={lawn}
        myId={myId}
        canShoot={canShootNow}
        isPlacing={placeRadius !== null}
        placeRadius={placeRadius ?? 0}
        {...handlers}
      />
      <GolfCameraRig rigRef={rigRef} hole={hole} focusId={focusId} />
    </Canvas>
  )
}

export default GolfScene
