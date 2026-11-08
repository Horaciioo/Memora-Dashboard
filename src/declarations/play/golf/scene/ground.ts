/**
 * Ground grid and the glow round resting balls, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_GROUND = {
  grid: {
    // Joint darkening, share of the cell drawn as joint
    joint: 0.06,
    jointWidth: 0.04,
    // Tint spread from one cell to the next, a few percent
    tint: 0.035,
    // Cells finer than this on screen fade out, in cells per pixel
    fadeFrom: 0.12,
    fadeTo: 0.45,
    // Cells lit white round a resting ball
    halo: {
      radius: 0.95,
      amplitude: 0.3,
      period: 2.4,
      // Strength of the own ball and of the others
      mine: 0.85,
      other: 0.45,
      // Seconds to light up and to fade when the ball rolls
      lightUp: 0.5,
      fadeOut: 0.12,
      // Soft edge, in cells
      edge: 1.5,
    },
  },
} as const
