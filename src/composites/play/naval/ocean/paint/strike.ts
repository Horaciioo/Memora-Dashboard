import { centreOf, clamp01, noise } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { isHitCode, NavalCodes } from '@/core/lib/play/naval/state'
import type { NavalShotView, NavalStrikeView } from '@/core/lib/play/naval/state'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { NavalWeapons } from '@/utils/constants/play'

/**
 * Strike on screen and its start
 * @typedef {Object} OceanStrike
 */

export interface OceanStrike {
  strike: NavalStrikeView
  startedAt: number
}

// Gap between two landings of one strike, in milliseconds
const CHAIN_MS = 90
// Debris thrown by a hit
const DEBRIS = 7

/**
 * Landing time of each square, from the strike start
 * @param {NavalStrikeView} strike - Strike
 * @param {number} index - Square order
 * @return {number} - Milliseconds
 */

export const landingOf = (strike: NavalStrikeView, index: number): number =>
  NAVAL_SETTINGS.flightMs + index * CHAIN_MS

/**
 * Shell in flight: arc above the sea, shadow below that grows as it falls
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} to - Pixel target
 * @param {number} progress - Zero to one
 * @return {void}
 */

const paintShell = (frame: OceanFrame, to: { x: number; y: number }, progress: number): void => {
  const { ctx, cell, width, skin } = frame
  const from = { x: width / 2, y: width + cell * 3 }
  const arc = Math.hypot(to.x - from.x, to.y - from.y) * 0.35
  const pointAt = (step: number) => ({
    x: from.x + (to.x - from.x) * step,
    ground: from.y + (to.y - from.y) * step,
    height: Math.sin(Math.PI * step) * arc,
  })
  const now = pointAt(progress)
  const back = pointAt(Math.max(0, progress - 0.1))
  ctx.fillStyle = NAVAL_WATER.shadow
  ctx.beginPath()
  ctx.ellipse(now.x, now.ground, cell * 0.2 * progress, cell * 0.1 * progress, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = skin.trail
  ctx.lineWidth = cell * 0.08
  ctx.beginPath()
  ctx.moveTo(back.x, back.ground - back.height)
  ctx.lineTo(now.x, now.ground - now.height)
  ctx.stroke()
  ctx.fillStyle = skin.shell
  ctx.beginPath()
  ctx.arc(
    now.x,
    now.ground - now.height,
    cell * (0.14 + (0.1 * now.height) / width),
    0,
    Math.PI * 2
  )
  ctx.fill()
}

/**
 * Splash crown and rings of a miss, or flash, debris and fire of a hit
 * @param {OceanFrame} frame - Frame
 * @param {NavalShotView} cell - Square
 * @param {number} age - Milliseconds since landing
 * @return {void}
 */

const paintImpact = (frame: OceanFrame, cell: NavalShotView, age: number): void => {
  const { ctx, cell: px } = frame
  const at = centreOf(frame, cell.x, cell.y)
  const life = clamp01(age / NAVAL_SETTINGS.impactMs)
  if (!isHitCode(cell.code)) {
    ctx.strokeStyle = NAVAL_WATER.foam
    for (const ring of [0, 0.25]) {
      const grow = clamp01(life - ring)
      ctx.globalAlpha = 1 - grow
      ctx.lineWidth = px * 0.05
      ctx.beginPath()
      ctx.ellipse(at.x, at.y, px * (0.15 + grow * 0.6), px * (0.1 + grow * 0.4), 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.fillStyle = NAVAL_WATER.foam
    for (let drop = 0; drop < 8; drop += 1) {
      const angle = (drop / 8) * Math.PI * 2
      const lift = Math.sin(Math.PI * life) * px * 0.55
      ctx.globalAlpha = 1 - life
      ctx.beginPath()
      ctx.arc(
        at.x + Math.cos(angle) * px * 0.25 * (0.5 + life),
        at.y - lift * (0.6 + noise(drop) * 0.6),
        px * 0.06,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    ctx.globalAlpha = 1

    return
  }
  const isSunk = cell.code === NavalCodes.Sunk
  const flash = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, px * (isSunk ? 1.6 : 1))
  flash.addColorStop(0, 'white')
  flash.addColorStop(0.3, NAVAL_WATER.fire)
  flash.addColorStop(1, 'transparent')
  ctx.globalAlpha = 1 - life
  ctx.fillStyle = flash
  ctx.fillRect(at.x - px * 2, at.y - px * 2, px * 4, px * 4)
  ctx.fillStyle = frame.skin.dark
  for (let bit = 0; bit < DEBRIS; bit += 1) {
    const angle = noise(cell.x * 31 + cell.y * 7 + bit) * Math.PI * 2
    const speed = px * (0.6 + noise(bit + cell.x) * 0.8)
    ctx.fillRect(
      at.x + Math.cos(angle) * speed * life,
      at.y +
        Math.sin(angle) * speed * life -
        Math.sin(Math.PI * life) * px * 0.6 +
        life * life * px * 0.4,
      px * 0.07,
      px * 0.07
    )
  }
  ctx.globalAlpha = 1
}

/**
 * Planes crossing over the line of an air strike
 * @param {OceanFrame} frame - Frame
 * @param {NavalStrikeView} strike - Strike
 * @param {number} age - Milliseconds since the start
 * @return {void}
 */

const paintPlanes = (frame: OceanFrame, strike: NavalStrikeView, age: number): void => {
  const { ctx, cell, width } = frame
  const first = centreOf(frame, strike.cells[0].x, strike.cells[0].y)
  const isAcross = strike.orientation % 2 === 0
  const progress = clamp01(age / (NAVAL_SETTINGS.flightMs + strike.cells.length * CHAIN_MS + 300))
  const travel = -width * 0.2 + progress * width * 1.4
  ctx.fillStyle = NAVAL_WATER.plane
  for (const wing of [-1, 0, 1]) {
    const x = isAcross ? travel - Math.abs(wing) * cell * 0.8 : first.x + wing * cell * 0.9
    const y = isAcross
      ? first.y + wing * cell * 0.9 - cell * 1.2
      : travel - Math.abs(wing) * cell * 0.8
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(isAcross ? 0 : Math.PI / 2)
    ctx.beginPath()
    ctx.moveTo(cell * 0.5, 0)
    ctx.lineTo(-cell * 0.3, -cell * 0.5)
    ctx.lineTo(-cell * 0.1, 0)
    ctx.lineTo(-cell * 0.3, cell * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

/**
 * Wake of a torpedo running from its edge to the last square
 * @param {OceanFrame} frame - Frame
 * @param {NavalStrikeView} strike - Strike
 * @param {number} age - Milliseconds since the start
 * @return {void}
 */

const paintWake = (frame: OceanFrame, strike: NavalStrikeView, age: number): void => {
  const { ctx, cell } = frame
  const from = centreOf(frame, strike.cells[0].x, strike.cells[0].y)
  const last = strike.cells.at(-1) ?? strike.cells[0]
  const to = centreOf(frame, last.x, last.y)
  const run = clamp01(age / NAVAL_SETTINGS.flightMs)
  const head = { x: from.x + (to.x - from.x) * run, y: from.y + (to.y - from.y) * run }
  ctx.strokeStyle = NAVAL_WATER.wake
  ctx.lineCap = 'round'
  ctx.lineWidth = cell * 0.18
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(head.x, head.y)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = frame.skin.shell
  ctx.beginPath()
  ctx.arc(head.x, head.y, cell * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Flare rising, then drifting down under its chute, its light spreading
 * @param {OceanFrame} frame - Frame
 * @param {NavalStrikeView} strike - Strike
 * @param {number} age - Milliseconds since the start
 * @return {void}
 */

const paintFlare = (frame: OceanFrame, strike: NavalStrikeView, age: number): void => {
  const { ctx, cell } = frame
  const xs = strike.cells.map((c) => c.x)
  const ys = strike.cells.map((c) => c.y)
  const mid = centreOf(
    frame,
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2
  )
  const reach = ((Math.max(...xs) - Math.min(...xs)) / 2 + 1) * cell
  const fall = clamp01(age / (NAVAL_SETTINGS.flightMs + NAVAL_SETTINGS.impactMs))
  const height = (1 - fall) * reach * 1.5
  const light = ctx.createRadialGradient(
    mid.x,
    mid.y,
    0,
    mid.x,
    mid.y,
    reach * 1.3 * Math.min(1, fall * 2)
  )
  light.addColorStop(0, NAVAL_WATER.flare)
  light.addColorStop(1, 'transparent')
  ctx.fillStyle = light
  ctx.fillRect(mid.x - reach * 1.4, mid.y - reach * 1.4, reach * 2.8, reach * 2.8)
  ctx.fillStyle = NAVAL_WATER.foam
  ctx.beginPath()
  ctx.arc(mid.x, mid.y - height - cell * 0.5, cell * 0.35, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = NAVAL_WATER.fire
  ctx.beginPath()
  ctx.arc(mid.x, mid.y - height, cell * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Weapon name of a strike
 * @param {NavalStrikeView} strike - Strike
 * @return {string} - Name
 */

const weaponOfStrike = (strike: NavalStrikeView): string =>
  NAVAL_WEAPONS[strike.weapon]?.name ?? NavalWeapons.Cannon

/**
 * Whole strike: delivery by weapon, then every impact on time
 * @param {OceanFrame} frame - Frame
 * @param {OceanStrike} playing - Strike on screen
 * @return {number} - Landings now shaking the screen, zero to one
 */

export const paintStrike = (frame: OceanFrame, { strike, startedAt }: OceanStrike): number => {
  const age = frame.now - startedAt
  const weapon = weaponOfStrike(strike)
  if (weapon === NavalWeapons.Airstrike) paintPlanes(frame, strike, age)
  if (weapon === NavalWeapons.Torpedo) paintWake(frame, strike, age)
  if (weapon === NavalWeapons.Flare) {
    paintFlare(frame, strike, age)

    return 0
  }
  let shake = 0
  strike.cells.forEach((cell, index) => {
    const landing =
      weapon === NavalWeapons.Torpedo && index < strike.cells.length - 1
        ? -1
        : landingOf(strike, index)
    if (landing < 0) return
    const progress = age / landing
    if (progress < 1 && weapon !== NavalWeapons.Torpedo) {
      const start = weapon === NavalWeapons.Airstrike ? 0.55 : 0
      if (progress >= start)
        paintShell(frame, centreOf(frame, cell.x, cell.y), (progress - start) / (1 - start))
      return
    }
    if (progress < 1) return
    paintImpact(frame, cell, age - landing)
    if (isHitCode(cell.code)) shake = Math.max(shake, 1 - clamp01((age - landing) / 320))
  })

  return shake
}
