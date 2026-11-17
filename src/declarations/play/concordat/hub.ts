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
  foam: [150, 154, 156],
  // Light from the north west: height step that makes a tile lighter or darker, in channel units
  relief: 0,
  // RGB per terrain id, sea first
  land: [
    [0, 0, 0],
    [230, 216, 170],
    [212, 214, 156],
    [176, 192, 128],
    [208, 196, 152],
    [226, 224, 214],
    [74, 118, 164],
    [232, 212, 164],
  ],
  // RGB of the sea
  sea: [74, 118, 164],
  // One flat water colour, the steps all match, then reach in tiles and how far they wander
  depths: [
    [74, 118, 164],
    [74, 118, 164],
    [74, 118, 164],
    [74, 118, 164],
    [74, 118, 164],
  ],
  reach: 18,
  warp: 0.7,
} as const
