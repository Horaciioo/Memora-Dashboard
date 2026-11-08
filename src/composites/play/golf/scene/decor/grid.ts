import { Vector2, Vector4 } from 'three'
import type { WebGLProgramParametersWithUniforms } from 'three'

import { contourPatch } from '@/composites/play/golf/scene/obstacles/contours'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { grid } = GOLF_SCENE
const { halo } = grid
const CELL = GOLF_SETTINGS.grid.cell
// One glow slot per seat
export const GRID_BALLS = GOLF_SETTINGS.maxPlayers

/**
 * Cell of a map point, the same on every slab
 * @param {number} x - Map x
 * @param {number} z - Map z
 * @param {number} cell - Cell side
 * @return {[number, number]} - Cell column and row
 */

export const gridCellOf = (x: number, z: number, cell: number = CELL): [number, number] => [
  Math.floor(x / cell + 1e-9),
  Math.floor(z / cell + 1e-9),
]

/**
 * Glow radius at a time, tightening toward the ball then easing back
 * @param {number} seconds - Time
 * @return {number} - Radius in metres
 */

export const haloRadius = (seconds: number): number =>
  halo.radius - halo.amplitude * (0.5 - 0.5 * Math.cos((2 * Math.PI * seconds) / halo.period))

/**
 * Uniforms shared by every ground material of the canvas
 * @typedef {Object} GolfGridUniforms
 */

export const GRID_UNIFORMS = {
  // Played hole spot on its map, keeps cells aligned across holes
  uGridOrigin: { value: new Vector2() },
  uHaloRadius: { value: halo.radius as number },
  // x z, growth from the ball, strength
  uBalls: { value: Array.from({ length: GRID_BALLS }, () => new Vector4()) },
}

// Float literal for GLSL
const glsl = (value: number): string => value.toFixed(4)

const VERTEX_HEAD = 'varying vec2 vGridWorld;'
const VERTEX_BODY = 'vGridWorld = (modelMatrix * vec4(transformed, 1.0)).xz;'

const FRAGMENT_HEAD = `
varying vec2 vGridWorld;
uniform vec2 uGridOrigin;
uniform float uHaloRadius;
uniform vec4 uBalls[${GRID_BALLS}];
float gridHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
}
`

// Faint joints and tint per cell, whole cells lit white round resting balls
const FRAGMENT_BODY = `
vec2 gridAt = (vGridWorld + uGridOrigin) / ${glsl(CELL)};
vec2 gridCell = floor(gridAt);
vec2 gridIn = fract(gridAt);
float gridEdge = min(min(gridIn.x, 1.0 - gridIn.x), min(gridIn.y, 1.0 - gridIn.y));
float gridSpan = max(fwidth(gridAt.x), fwidth(gridAt.y));
float gridSeen = 1.0 - smoothstep(${glsl(grid.fadeFrom)}, ${glsl(grid.fadeTo)}, gridSpan);
float gridJoint = 1.0 - smoothstep(${glsl(grid.jointWidth)}, ${glsl(grid.jointWidth)} + gridSpan, gridEdge);
diffuseColor.rgb *= 1.0 - gridJoint * gridSeen * ${glsl(grid.joint)};
diffuseColor.rgb *= 1.0 + (gridHash(gridCell) - 0.5) * 2.0 * ${glsl(grid.tint)} * gridSeen;
vec2 gridMid = (gridCell + 0.5) * ${glsl(CELL)} - uGridOrigin;
float gridLit = 0.0;
for (int ball = 0; ball < ${GRID_BALLS}; ball++) {
  vec4 spot = uBalls[ball];
  if (spot.z <= 0.0) continue;
  float reach = uHaloRadius * sqrt(spot.z);
  float away = length(gridMid - spot.xy);
  float lit = 1.0 - smoothstep(reach - ${glsl(CELL * halo.edge)}, reach, away);
  gridLit = max(gridLit, lit * spot.z * spot.w);
}
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), gridLit);
`

/**
 * Hooks level lines, the cell grid and the resting glow into a ground material
 * @param {WebGLProgramParametersWithUniforms} shader - Shader
 * @return {void}
 */

export const groundPatch = (shader: WebGLProgramParametersWithUniforms): void => {
  contourPatch(shader)
  Object.assign(shader.uniforms, GRID_UNIFORMS)
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTEX_BODY}`)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${FRAGMENT_HEAD}`)
    .replace('#include <color_fragment>', `#include <color_fragment>\n${FRAGMENT_BODY}`)
}
