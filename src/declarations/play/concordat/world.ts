import { ConcordatSizes, ConcordatStyles } from '@/utils/constants/concordat'
import type { ConcordatSizeName, ConcordatStyleName } from '@/utils/constants/concordat'

/**
 * View window on the world, in degrees
 * @typedef {Object} ConcordatWindow
 */

export interface ConcordatWindow {
  lonMin: number
  lonMax: number
  latMax: number
  latMin: number
  // Detail multiplier over the world view
  zoom: number
}

/**
 * Window of every map style
 * @type {Record<ConcordatStyleName, ConcordatWindow>}
 */

export const CONCORDAT_WINDOWS: Record<ConcordatStyleName, ConcordatWindow> = {
  [ConcordatStyles.World]: { lonMin: -180, lonMax: 180, latMax: 84, latMin: -58, zoom: 1 },
  [ConcordatStyles.Europe]: { lonMin: -25, lonMax: 48, latMax: 72, latMin: 33, zoom: 2.4 },
  [ConcordatStyles.Asia]: { lonMin: 25, lonMax: 150, latMax: 78, latMin: -12, zoom: 1.6 },
  [ConcordatStyles.Africa]: { lonMin: -20, lonMax: 55, latMax: 38, latMin: -36, zoom: 2.2 },
  [ConcordatStyles.Americas]: { lonMin: -170, lonMax: -30, latMax: 75, latMin: -57, zoom: 1.6 },
  [ConcordatStyles.Mediterranean]: { lonMin: -8, lonMax: 38, latMax: 42, latMin: 29, zoom: 3.6 },
  [ConcordatStyles.Oceania]: { lonMin: 92, lonMax: 180, latMax: 22, latMin: -50, zoom: 2 },
}

/**
 * Mountain chain, points in lon/lat, reach and height in 0 to 1
 * @typedef {Object} ConcordatRange
 */

export interface ConcordatRange {
  points: number[][]
  reach: number
  power: number
}

/**
 * Real ranges, they raise the relief around their line
 * @type {ConcordatRange[]}
 */

export const CONCORDAT_RANGES: ConcordatRange[] = [
  {
    points: [
      [70, 36],
      [78, 34],
      [86, 28],
      [95, 28],
      [100, 27],
    ],
    reach: 3.5,
    power: 1,
  },
  {
    points: [
      [78, 36],
      [88, 36],
      [96, 35],
    ],
    reach: 3,
    power: 0.9,
  },
  {
    points: [
      [70, 42],
      [80, 42],
      [88, 48],
      [95, 50],
    ],
    reach: 2.2,
    power: 0.85,
  },
  {
    points: [
      [6, 44.5],
      [10, 46.5],
      [14, 47],
      [17, 47.5],
    ],
    reach: 1.3,
    power: 0.95,
  },
  {
    points: [
      [-2, 43],
      [3, 42.5],
    ],
    reach: 0.9,
    power: 0.85,
  },
  {
    points: [
      [38, 44],
      [48, 41],
    ],
    reach: 1.2,
    power: 0.95,
  },
  {
    points: [
      [59, 52],
      [60, 60],
      [64, 68],
    ],
    reach: 1.3,
    power: 0.7,
  },
  {
    points: [
      [19, 49],
      [24, 49],
      [26, 47],
      [24, 45.5],
    ],
    reach: 1.1,
    power: 0.7,
  },
  {
    points: [
      [6, 60],
      [14, 66],
      [20, 69],
    ],
    reach: 1.6,
    power: 0.7,
  },
  {
    points: [
      [-9, 31],
      [-3, 34],
      [5, 36],
      [10, 36.5],
    ],
    reach: 1.3,
    power: 0.8,
  },
  {
    points: [
      [36, 8],
      [40, 12],
    ],
    reach: 3,
    power: 0.8,
  },
  {
    points: [
      [30, -5],
      [35, -10],
      [33, -15],
    ],
    reach: 2.5,
    power: 0.6,
  },
  {
    points: [
      [28, -30],
      [30, -26],
    ],
    reach: 1.6,
    power: 0.65,
  },
  {
    points: [
      [44, 37],
      [50, 32],
      [57, 27],
    ],
    reach: 1.9,
    power: 0.8,
  },
  {
    points: [
      [73, 20],
      [76, 10],
    ],
    reach: 1.1,
    power: 0.5,
  },
  {
    points: [
      [100, 22],
      [104, 16],
    ],
    reach: 2,
    power: 0.5,
  },
  {
    points: [
      [-150, 62],
      [-142, 61],
    ],
    reach: 2.2,
    power: 0.9,
  },
  {
    points: [
      [-125, 60],
      [-116, 52],
      [-110, 44],
      [-107, 37],
      [-106, 32],
    ],
    reach: 3,
    power: 0.95,
  },
  {
    points: [
      [-122, 48],
      [-121, 40],
      [-118, 36],
    ],
    reach: 1.6,
    power: 0.8,
  },
  {
    points: [
      [-84, 35],
      [-78, 39],
      [-72, 44],
    ],
    reach: 1.6,
    power: 0.55,
  },
  {
    points: [
      [-108, 30],
      [-104, 24],
      [-100, 19],
    ],
    reach: 2,
    power: 0.8,
  },
  {
    points: [
      [-72, 10],
      [-76, 0],
      [-78, -8],
      [-70, -18],
      [-70, -30],
      [-71, -40],
      [-73, -50],
    ],
    reach: 2.2,
    power: 1,
  },
  {
    points: [
      [145, -15],
      [150, -30],
      [147, -37],
    ],
    reach: 1.6,
    power: 0.5,
  },
]

/**
 * Climate patch, an ellipse that dries (negative) or waters (positive) the land
 * @typedef {Object} ConcordatPatch
 */

export interface ConcordatPatch {
  lon: number
  lat: number
  rx: number
  ry: number
  bias: number
}

/**
 * Real deserts then forests
 * @type {ConcordatPatch[]}
 */

export const CONCORDAT_PATCHES: ConcordatPatch[] = [
  { lon: 10, lat: 23, rx: 28, ry: 7, bias: -1 },
  { lon: 46, lat: 24, rx: 10, ry: 8, bias: -1 },
  { lon: 105, lat: 43, rx: 14, ry: 5, bias: -0.9 },
  { lon: 133, lat: -25, rx: 14, ry: 8, bias: -0.9 },
  { lon: 20, lat: -23, rx: 7, ry: 5, bias: -0.8 },
  { lon: -70, lat: -23, rx: 2.5, ry: 6, bias: -1 },
  { lon: -69, lat: -45, rx: 5, ry: 8, bias: -0.6 },
  { lon: -112, lat: 34, rx: 7, ry: 5, bias: -0.7 },
  { lon: 71, lat: 27, rx: 4, ry: 3, bias: -0.8 },
  { lon: 58, lat: 35, rx: 8, ry: 5, bias: -0.8 },
  { lon: 83, lat: 39, rx: 6, ry: 3, bias: -1 },
  { lon: 46, lat: 6, rx: 5, ry: 4, bias: -0.6 },
  { lon: -62, lat: -5, rx: 14, ry: 8, bias: 1 },
  { lon: 22, lat: 0, rx: 10, ry: 6, bias: 1 },
  { lon: 100, lat: 60, rx: 45, ry: 8, bias: 0.9 },
  { lon: -100, lat: 56, rx: 28, ry: 7, bias: 0.9 },
  { lon: 35, lat: 60, rx: 15, ry: 6, bias: 0.9 },
  { lon: 105, lat: 12, rx: 12, ry: 10, bias: 0.9 },
  { lon: 115, lat: 0, rx: 15, ry: 5, bias: 1 },
  { lon: -85, lat: 38, rx: 10, ry: 8, bias: 0.6 },
  { lon: 5, lat: 48, rx: 10, ry: 6, bias: 0.5 },
  { lon: -123, lat: 48, rx: 3, ry: 6, bias: 0.8 },
  { lon: 115, lat: 30, rx: 12, ry: 6, bias: 0.5 },
  { lon: 142, lat: -6, rx: 8, ry: 3, bias: 1 },
  { lon: 150, lat: -25, rx: 3, ry: 10, bias: 0.5 },
  { lon: 48, lat: -18, rx: 3, ry: 6, bias: 0.5 },
  { lon: -73, lat: -42, rx: 2, ry: 6, bias: 0.8 },
]

/**
 * Silhouette picture of a map style
 * @param {ConcordatStyleName} style - Style
 * @return {string} - Public path
 */

export const concordatRegionArt = (style: ConcordatStyleName): string =>
  `/play/concordat/regions/${style}.svg`

/**
 * Dots per side drawn for each map size
 * @type {Record<ConcordatSizeName, number>}
 */

export const CONCORDAT_SIZE_DOTS: Record<ConcordatSizeName, number> = {
  [ConcordatSizes.Small]: 3,
  [ConcordatSizes.Medium]: 5,
  [ConcordatSizes.Large]: 7,
}
