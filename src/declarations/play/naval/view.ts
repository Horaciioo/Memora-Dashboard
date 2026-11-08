import naval from '@/configurations/play/naval.json'
import { readInteger, readNode, readNumber } from '@/declarations/configurations/readers'
import { NavalWeapons } from '@/utils/constants/play'
import type { NavalWeaponName } from '@/utils/constants/play'

// Raw nodes
const view = readNode(naval.view, 'play/naval.view')
const shake = readNode(naval.shake, 'play/naval.shake')

/**
 * Camera and gestures of a sea
 * @type {Object}
 */

export const NAVAL_VIEW = {
  // Board tilt in degrees, and the eye distance in pixels
  tilt: readNumber(view.tilt, { path: 'play/naval.view.tilt', fallback: 14, min: 0, max: 40 }),
  perspective: readInteger(view.perspective, {
    path: 'play/naval.view.perspective',
    fallback: 1600,
    min: 400,
  }),
  // Squares across on arrival, and at the closest zoom
  startCells: readInteger(view.startCells, {
    path: 'play/naval.view.startCells',
    fallback: 14,
    min: 4,
  }),
  minCells: readInteger(view.minCells, { path: 'play/naval.view.minCells', fallback: 6, min: 2 }),
  zoomStep: readNumber(view.zoomStep, {
    path: 'play/naval.view.zoomStep',
    fallback: 1.15,
    min: 1.01,
  }),
  // Finger travel that still counts as a tap, and as a swipe
  tapSlopPx: readInteger(view.tapSlopPx, {
    path: 'play/naval.view.tapSlopPx',
    fallback: 10,
    min: 1,
  }),
  swipePx: readInteger(view.swipePx, { path: 'play/naval.view.swipePx', fallback: 24, min: 4 }),
  // Sea size from which the mini map shows
  mapFrom: readInteger(view.mapFrom, { path: 'play/naval.view.mapFrom', fallback: 13, min: 1 }),
}

/**
 * Screen shake of each weapon, in pixels
 * @type {Record<NavalWeaponName, number>}
 */

export const NAVAL_SHAKE = Object.fromEntries(
  Object.values(NavalWeapons).map((name) => [
    name,
    readNumber(shake[name], { path: `play/naval.shake.${name}`, fallback: 0, min: 0, max: 30 }),
  ])
) as Record<NavalWeaponName, number>
