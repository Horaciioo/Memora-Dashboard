import { ConcordatSizes, ConcordatStyles } from '@/utils/constants/concordat'

/**
 * Concordat hub: the world map painted behind the menu
 * @type {Object}
 */

export const CONCORDAT_HUB = {
  ground: 'concordat-map',
  // Fixed world, two big continents and islands, same at each visit
  map: { seed: 8, size: ConcordatSizes.Small, style: ConcordatStyles.World, actors: 12 },
  // Pixels per tile once painted
  pixel: 4,
  // Share of the land colour kept on the shore line
  outline: 1,
  // Pale line of the sea along the shore
  foam: [244, 248, 250],
  // Light from the north west: height step that makes a tile lighter or darker, in channel units
  relief: 0,
  // RGB per terrain id, sea first
  land: [
    [0, 0, 0],
    [232, 214, 160],
    [150, 196, 112],
    [92, 150, 92],
    [176, 170, 118],
    [150, 146, 150],
    [112, 176, 214],
    [226, 196, 128],
  ],
  // RGB of the deep sea
  sea: [58, 104, 156],
  // Water from shallow to deep, then reach in tiles and how far the steps wander
  depths: [
    [150, 212, 218],
    [112, 184, 206],
    [82, 150, 192],
    [58, 116, 168],
    [44, 92, 148],
  ],
  reach: 18,
  warp: 0.7,
} as const
