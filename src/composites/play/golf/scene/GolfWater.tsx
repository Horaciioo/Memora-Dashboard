'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide } from 'three'
import type { BufferGeometry, WebGLProgramParametersWithUniforms } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { water } = GOLF_SCENE
const { wave, deep, foam, glint } = water

// Float literal for GLSL
const glsl = (value: number): string => value.toFixed(4)

// Edge distances to the fragment
const VERTEX_HEAD = 'attribute vec4 shore;\nvarying vec4 vShore;\nvarying vec2 vGround;'
const VERTEX_BODY = 'vShore = shore;\nvGround = position.xz;'

// Time and colours
const FRAGMENT_HEAD = `
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uCrest;
varying vec4 vShore;
varying vec2 vGround;
float waterHash(vec2 cell) { return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453); }
`

// Depth tint, crest bands, glints, shore foam
const FRAGMENT_BODY = `
float edge = min(min(vShore.x, vShore.y), min(vShore.z, vShore.w));
vec2 ground = vGround;
float t = uTime * ${glsl(wave.speed)};
float swell = max(sin(ground.x * ${glsl(wave.x)} + sin(ground.y * ${glsl(wave.z)} + t) * 0.9 + t * 0.4), sin((ground.x + ground.y) * ${glsl(wave.diagonal)} - t * 0.7 + sin(ground.x * 1.3 - t) * 0.7));
vec3 tint = mix(diffuseColor.rgb, uDeep, smoothstep(0.0, ${glsl(deep.reach)}, edge));
tint = mix(tint, uCrest, step(${glsl(wave.crest)}, swell));
float glint = step(${glsl(glint.chance)}, waterHash(floor(ground * ${glsl(glint.density)}) + floor(uTime * ${glsl(glint.rate)})));
tint = mix(tint, vec3(1.0), glint);
float rim = ${glsl(foam.width)} + sin((ground.x + ground.y) * ${glsl(foam.ripple)} + uTime * ${glsl(foam.speed)}) * ${glsl(foam.wobble)};
tint = mix(tint, vec3(1.0), step(edge, rim));
diffuseColor.rgb = tint;
`

/**
 * Pond: depth tint, crest bands, glints and foam, still toon lit
 * @param {Object} props - Water geometry and colours
 * @param {BufferGeometry} props.geometry - Water tops
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfWater = ({ geometry, paint }: { geometry: BufferGeometry; paint: GolfPaint }) => {
  const uniforms = useMemo(
    () => ({
      uDeep: { value: paint.water.clone().lerp(paint.shade, deep.shade) },
      uCrest: { value: paint.water.clone().lerp(new Color('white'), water.crest) },
    }),
    [paint]
  )

  // Clock for the waves
  const shaderRef = useRef<WebGLProgramParametersWithUniforms | null>(null)
  useFrame(({ clock }) => {
    const shader = shaderRef.current
    if (!shader) return
    shader.uniforms.uTime.value = clock.elapsedTime
    // Colours follow the course
    shader.uniforms.uDeep.value = uniforms.uDeep.value
    shader.uniforms.uCrest.value = uniforms.uCrest.value
  })

  // Hook the waves into the toon shader
  const patch = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = { value: 0 }
    Object.assign(shader.uniforms, uniforms)
    shaderRef.current = shader
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTEX_BODY}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_HEAD}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${FRAGMENT_BODY}`)
  }

  return (
    <mesh geometry={geometry} position={[0, -water.sink, 0]} receiveShadow>
      <meshToonMaterial
        color={paint.water}
        side={DoubleSide}
        transparent
        opacity={water.opacity}
        onBeforeCompile={patch}
      />
    </mesh>
  )
}
