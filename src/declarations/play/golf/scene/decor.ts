/**
 * Decor around the course, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_DECOR = {
  // Columns hanging down the walls, one or two each, fading into the mist
  specks: { twoFrom: 3, min: 0.45, max: 0.75, minDrop: 0.5, maxDrop: 1.6, sink: 0.55, under: 0.12 },
  // Lumpy cube clouds around the course
  mist: {
    puffs: 14,
    cubes: 5,
    size: 3.4,
    cubeMin: 0.45,
    flat: 0.6,
    spread: 1.4,
    below: 1.6,
    rise: 0.4,
    opacity: 0.5,
    drift: 0.05,
    // Golden angle spreads the puffs evenly
    turn: 2.39996,
    // Low layers under the slabs and at the foot of the walls, top always under the lawn
    low: {
      layers: 9,
      top: 0.35,
      depth: 3.2,
      size: 7,
      spread: 0.75,
      opacity: 0.42,
      speed: 0.06,
      drift: 0.35,
    },
  },
  // Rounded cubes around and under the course, sizes in grid cells
  decorCubes: {
    count: 22,
    tries: 260,
    sizes: [3, 4, 6, 8],
    // Share of each shape: plain, chipped, holed
    shares: [0.55, 0.25, 0.2],
    corner: 0.12,
    // Distance from the course, in course reaches
    near: 0.62,
    far: 1.35,
    // Heights, metres, mostly below the lawn
    low: -7,
    high: 0.5,
    // Kept off the course, cells
    margin: 3,
    // Minimum gap between two cubes, cells
    spacing: 2,
    // Default camera wedge kept clear, radians and metres
    wedge: 0.75,
    wedgeReach: 16,
    // Chip and frame of the shapes, share of the side
    chip: 0.32,
    hole: 0.42,
    tones: 3,
  },
  // Puffy clouds around the course
  clouds: {
    count: 12,
    near: 0.7,
    far: 1.6,
    low: -4,
    high: 2.5,
    minLumps: 3,
    maxLumps: 5,
    gap: 0.9,
    rise: 0.4,
    minSize: 0.6,
    maxSize: 1.2,
    drift: 0.012,
  },
  // One huge plain block butted against a course edge, now and then
  blocks: {
    // Share of holes that get a block at all
    chance: 0.4,
    minSize: 7,
    maxSize: 12,
    minHeight: 6,
    maxHeight: 11,
    // Sunk past the course edge, so no gap ever shows
    overlap: 0.6,
    // Paint tones picked from the palette, by index
    tones: 3,
  },
  sky: { radius: 90, segments: 24 },
  // Stars of the space map
  stars: { count: 220, reach: 0.95, size: 2 },
} as const
