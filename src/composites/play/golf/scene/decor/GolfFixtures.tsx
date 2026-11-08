'use client'

import type { RefObject } from 'react'

import { GolfBoosts } from '@/composites/play/golf/scene/course/GolfBoosts'
import { GolfBumper } from '@/composites/play/golf/scene/course/GolfBumper'
import { useReveal } from '@/composites/play/golf/scene/obstacles/useReveal'
import { GolfOrb } from '@/composites/play/golf/scene/course/GolfOrb'
import { GolfSpinner } from '@/composites/play/golf/scene/obstacles/GolfSpinner'
import { GolfSplash } from '@/composites/play/golf/scene/obstacles/GolfSplash'
import { GolfTornado } from '@/composites/play/golf/scene/weather/GolfTornado'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfFace } from '@/composites/play/golf/types'
import { seatColor } from '@/composites/play/golf/scene/decor/paint'
import { isEffectActive } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { powers } = GOLF_SETTINGS

/**
 * What every fixture reads
 * @typedef {Object} FixtureProps
 */

interface FixtureProps {
  hole: GolfHole
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
  // Server ms now
  serverNow: () => number
}

/**
 * Bumper of the course, born only once a ball finds it when hidden
 * @param {Object} props - Bumper and hole
 * @return {JSX.Element | null}
 */

const GolfFixedBumper = ({
  entry,
  hole,
  paint,
  motionRef,
}: {
  entry: GolfHole['bumpers'][number]
  hole: GolfHole
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
}) => {
  const zone = {
    x0: entry.x - entry.r,
    x1: entry.x + entry.r,
    z0: entry.z - entry.r,
    z1: entry.z + entry.r,
  }
  const isRevealed = useReveal(motionRef, zone, entry.id)
  if (entry.isHidden && !isRevealed) return null

  return (
    <GolfBumper
      id={entry.id}
      spot={{ x: entry.x, z: entry.z, hole }}
      radius={entry.r}
      color={paint.bumper}
      paint={paint}
      motionRef={motionRef}
    />
  )
}

/**
 * Bumpers, bars, orbs and laid powers of a hole
 * @param {FixtureProps & Object} props - Hole and its state
 * @return {JSX.Element}
 */

export const GolfFixtures = ({
  hole,
  paint,
  motionRef,
  serverNow,
  startsAt,
  takenOrbs,
  hazards,
  seatOf,
  faceOf,
}: FixtureProps & {
  startsAt: number
  takenOrbs: number[]
  hazards: GolfHazard[]
  seatOf: (accountId: string) => string
  faceOf: (accountId: string) => GolfFace | undefined
}) => (
  <>
    <GolfBoosts hole={hole} paint={paint} motionRef={motionRef} />
    {hole.bumpers.map((entry) => (
      <GolfFixedBumper
        key={entry.id}
        entry={entry}
        hole={hole}
        paint={paint}
        motionRef={motionRef}
      />
    ))}
    {hole.spinners.map((entry, index) => (
      <GolfSpinner
        key={index}
        entry={entry}
        paint={paint}
        startsAt={startsAt}
        serverNow={serverNow}
      />
    ))}
    <GolfSplash motionRef={motionRef} paint={paint} />
    {hole.orbs.map((_, index) => (
      <GolfOrb
        key={index}
        hole={hole}
        paint={paint}
        index={index}
        takenUntil={takenOrbs[index] ?? 0}
        serverNow={serverNow}
      />
    ))}
    {hazards
      .filter((hazard) => isEffectActive(hazard, serverNow()))
      .map((hazard) =>
        hazard.power === GolfPowers.Tornado ? (
          <GolfTornado
            key={hazard.id}
            hazard={hazard}
            hole={hole}
            paint={paint}
            serverNow={serverNow}
          />
        ) : hazard.power !== GolfPowers.Bumper ? null : (
          <GolfBumper
            key={hazard.id}
            id={hazard.id}
            spot={{ x: hazard.x, z: hazard.z, hole }}
            radius={powers.bumper.radius}
            color={seatColor(seatOf(hazard.ownerId))}
            paint={paint}
            motionRef={motionRef}
            face={faceOf(hazard.ownerId)}
            hearts={{ lives: hazard.lives ?? 0, max: powers.bumper.lives }}
          />
        )
      )}
  </>
)
