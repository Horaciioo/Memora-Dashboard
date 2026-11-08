import type { WebGLProgramParametersWithUniforms } from 'three'

import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { contour } = GOLF_SCENE

// Float literal for GLSL
const glsl = (value: number): string => value.toFixed(4)

// Height and tilt to the fragment
const VERTEX_HEAD = 'varying float vHeight;\nvarying float vTilt;'
const VERTEX_BODY = 'vHeight = position.y;\nvTilt = 1.0 - normal.y;'

const FRAGMENT_HEAD = 'varying float vHeight;\nvarying float vTilt;'

// Level lines and shade, only where the ground tilts
const FRAGMENT_BODY = `
float sloped = step(0.002, vTilt);
float level = vHeight / ${glsl(contour.step)};
float near = abs(fract(level + 0.5) - 0.5);
float line = 1.0 - smoothstep(0.0, fwidth(level) * 1.2, near);
diffuseColor.rgb *= 1.0 - sloped * (${glsl(contour.line)} * line + vTilt * ${glsl(contour.shade)});
`

/**
 * Hooks level lines and slope shade into a ground material
 * @param {WebGLProgramParametersWithUniforms} shader - Shader
 * @return {void}
 */

export const contourPatch = (shader: WebGLProgramParametersWithUniforms): void => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTEX_BODY}`)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${FRAGMENT_HEAD}`)
    .replace('#include <color_fragment>', `#include <color_fragment>\n${FRAGMENT_BODY}`)
}
