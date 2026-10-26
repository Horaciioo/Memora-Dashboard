'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, Vector2 } from 'three'
import type { BufferGeometry, Group, InstancedMesh, WebGLProgramParametersWithUniforms } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { iceTexture, skyCube } from '@/composites/play/golf/scene/weatherTextures'
import { padByArea, padHeight } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GolfSurfaces } from '@/utils/constants/play'

const { ice } = GOLF_SCENE

// Shader hooks: the sheet grows from the caster and glows at its front
const FRONT_VERTEX = {
  head: '#include <common>\nvarying vec3 vIcePos;',
  body: '#include <begin_vertex>\nvIcePos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
}

const FRONT_FRAGMENT = {
  head: '#include <common>\nvarying vec3 vIcePos;\nuniform vec2 uOrigin;\nuniform float uFront;\nuniform float uBand;\nuniform float uMelt;',
  clip: '#include <clipping_planes_fragment>\nfloat iceDistance = distance(vIcePos.xz, uOrigin);\nif (iceDistance > uFront) discard;',
  tail: `#include <dithering_fragment>
float iceEdge = 1.0 - smoothstep(0.0, uBand, uFront - iceDistance);
gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.95, 0.99, 1.0), iceEdge * 0.85);
gl_FragColor.a *= (1.0 - uMelt);`,
}

/**
 * Time left to ice over, as a share of the melt
 * @param {GolfHazard} hazard - Ice
 * @param {number} now - Server ms
 * @return {number} - Zero solid, one gone
 */

const meltOf = (hazard: GolfHazard, now: number): number =>
  hazard.until === undefined
    ? 0
    : 1 - Math.min(1, Math.max(0, (hazard.until - now) / 1000 / ice.melt))

/**
 * Sheet of ice over the whole course: cracked glossy slab spreading from the caster, sparkles on top, melting at the end
 * @param {Object} props - Ice
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {BufferGeometry[]} props.tops - Floor geometries to cover
 * @param {GolfHazard} props.hazard - Ice power laid
 * @param {() => number} props.serverNow - Server ms now
 * @return {JSX.Element}
 */

export const GolfIce = ({
  hole,
  paint,
  tops,
  hazard,
  serverNow,
}: {
  hole: GolfHole
  paint: GolfPaint
  tops: BufferGeometry[]
  hazard: GolfHazard
  serverNow: () => number
}) => {
  const sheet = useRef<Group>(null)
  const sparks = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])

  // Shared by every floor mesh, moved each frame
  const uniforms = useMemo(
    () => ({
      uOrigin: { value: new Vector2(hazard.x, hazard.z) },
      uFront: { value: 0 },
      uBand: { value: ice.band },
      uMelt: { value: 0 },
    }),
    [hazard.x, hazard.z]
  )
  const live = useRef(uniforms)
  useEffect(() => {
    live.current = uniforms
  }, [uniforms])

  const { map, env } = useMemo(() => {
    const random = seededRandom(holeSeed(hole))
    const map = iceTexture(random, {
      body: paint.ice,
      deep: paint['ice-deep'],
      crack: paint['ice-crack'],
    })
    map.repeat.set(ice.repeat, ice.repeat)

    return { map, env: skyCube(paint['ice-deep'], paint.frost) }
  }, [hole, paint])
  useEffect(
    () => () => {
      map.dispose()
      env.dispose()
    },
    [map, env]
  )

  // Front and glow wired into the standard shader
  const hook = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', FRONT_VERTEX.head)
      .replace('#include <begin_vertex>', FRONT_VERTEX.body)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', FRONT_FRAGMENT.head)
      .replace('#include <clipping_planes_fragment>', FRONT_FRAGMENT.clip)
      .replace('#include <dithering_fragment>', FRONT_FRAGMENT.tail)
  }

  // Sparkles scattered over the slabs, by area
  const glints = useMemo(() => {
    const random = seededRandom(holeSeed(hole) + 7)
    const pads = hole.pads.filter((pad) => pad.surface !== GolfSurfaces.Water)

    return pads.length
      ? Array.from({ length: ice.sparkles }, () => {
          const pad = padByArea(pads, random())
          const x = pad.x0 + (pad.x1 - pad.x0) * random()
          const z = pad.z0 + (pad.z1 - pad.z0) * random()

          return { x, z, y: padHeight(pad, x, z) + ice.lift * 6, phase: random() * Math.PI * 2 }
        })
      : []
  }, [hole])

  useFrame(({ clock }) => {
    const now = serverNow()
    const since = Math.max(0, now - (hazard.laidAt ?? now)) / 1000
    const melt = meltOf(hazard, now)
    const front = since * ice.front
    live.current.uFront.value = front
    live.current.uMelt.value = melt
    if (sheet.current) sheet.current.visible = melt < 1
    const mesh = sparks.current
    if (!mesh) return
    glints.forEach((glint, index) => {
      // Lit once the front has passed
      const reached = Math.hypot(glint.x - hazard.x, glint.z - hazard.z) < front
      const wave = Math.max(0, Math.sin(clock.elapsedTime * ice.twinkle + glint.phase)) ** 4
      holder.position.set(glint.x, glint.y, glint.z)
      holder.rotation.y = clock.elapsedTime + glint.phase
      holder.scale.setScalar(reached ? wave * (1 - melt) : 0)
      holder.updateMatrix()
      mesh.setMatrixAt(index, holder.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={sheet}>
      {tops.map((top, index) => (
        <mesh key={index} geometry={top} position={[0, ice.lift, 0]} receiveShadow renderOrder={1}>
          <meshPhysicalMaterial
            map={map}
            envMap={env}
            envMapIntensity={ice.envIntensity}
            roughness={ice.roughness}
            clearcoat={ice.clearcoat}
            clearcoatRoughness={ice.roughness}
            transparent
            opacity={ice.opacity}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
            customProgramCacheKey={() => 'golf-ice'}
            onBeforeCompile={hook}
          />
        </mesh>
      ))}
      <instancedMesh
        ref={sparks}
        args={[undefined, undefined, glints.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[ice.sparkle, 0]} />
        <meshBasicMaterial color={paint.frost} />
      </instancedMesh>
    </group>
  )
}
