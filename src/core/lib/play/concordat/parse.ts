import type { ConcordatIntent } from '@/types/concordat'
import {
  CONCORDAT_BUILDING_ORDER,
  CONCORDAT_OFFER_ORDER,
  CONCORDAT_TECH_ORDER,
  ConcordatIntents,
  ConcordatOfferKinds,
} from '@/utils/constants/concordat'
import type { ConcordatBuildingKind, ConcordatOfferKind } from '@/utils/constants/concordat'

// Ask for a new board
export const CONCORDAT_RESYNC = 'resync'

// Whole number inside bounds
const whole = (value: unknown, max: number): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max ? value : null

// Entity ids and tiles stay inside a 32 bit index
const ID_MAX = 2_000_000_000

// Command of the systems: buildings, navy, diplomacy, trade
const systemIntent = (playerId: number, raw: Record<string, unknown>): ConcordatIntent | null => {
  const id = (key: string, max = ID_MAX) => whole(raw[key], max)
  const type = raw.type

  if (type === ConcordatIntents.Build) {
    const tile = id('tile')
    const building = CONCORDAT_BUILDING_ORDER.find((kind) => kind === raw.building)

    return tile === null || !building
      ? null
      : { kind: 'build', playerId, building: building as ConcordatBuildingKind, tile }
  }
  if (type === ConcordatIntents.Upgrade) {
    const target = id('id')

    return target === null ? null : { kind: 'upgrade', playerId, id: target }
  }
  if (type === ConcordatIntents.BuildShip) {
    const port = id('port')

    return port === null ? null : { kind: 'buildShip', playerId, port }
  }
  if (type === ConcordatIntents.MoveShip) {
    const ship = id('ship')
    const tile = id('tile')

    return ship === null || tile === null ? null : { kind: 'moveShip', playerId, ship, tile }
  }
  if (type === ConcordatIntents.Research) {
    const path = CONCORDAT_TECH_ORDER.find((kind) => kind === raw.path)

    return path ? { kind: 'research', playerId, path } : null
  }
  if (type === ConcordatIntents.Launch) {
    const silo = id('id')
    const tile = id('tile')

    // A strike is only fired with the second confirmation
    const weapon =
      raw.weapon === 'shell' || raw.weapon === 'rocket' || raw.weapon === 'mirv'
        ? raw.weapon
        : undefined

    return silo === null || tile === null || raw.confirm !== true
      ? null
      : { kind: 'launch', playerId, silo, tile, heavy: raw.heavy === true, weapon }
  }
  if (type === ConcordatIntents.Sortie) {
    const base = id('id')
    const tile = id('tile')
    const kind = raw.air === 'heli' || raw.air === 'fighter' ? raw.air : null

    return base === null || tile === null || !kind || raw.confirm !== true
      ? null
      : { kind: 'sortie', playerId, base, tile, air: kind }
  }
  if (type === ConcordatIntents.Sail) {
    const tile = id('tile')
    const percent = id('percent', 100)

    return tile === null || percent === null ? null : { kind: 'sail', playerId, tile, percent }
  }

  return diplomacyIntent(playerId, raw)
}

// Diplomacy and trade commands
const diplomacyIntent = (
  playerId: number,
  raw: Record<string, unknown>
): ConcordatIntent | null => {
  const type = raw.type
  const peer = whole(raw.to ?? raw.with, 255)

  if (type === ConcordatIntents.Propose || type === ConcordatIntents.OpenTrade) {
    const offer: ConcordatOfferKind | undefined =
      type === ConcordatIntents.OpenTrade
        ? ConcordatOfferKinds.Trade
        : CONCORDAT_OFFER_ORDER.find((kind) => kind === raw.offer)
    if (peer === null || !offer || offer === ConcordatOfferKinds.Coalition) return null

    return {
      kind: 'propose',
      playerId,
      to: peer,
      offer,
      minutes: whole(raw.minutes, 60) ?? 0,
      ask: whole(raw.ask, 3) ?? 0,
      about: whole(raw.about, 255) ?? 0,
    }
  }
  if (type === ConcordatIntents.Accept || type === ConcordatIntents.Refuse) {
    const offer = whole(raw.offer, ID_MAX)

    return offer === null ? null : { kind: type, playerId, offer }
  }
  if (type === ConcordatIntents.Break)
    return peer === null ? null : { kind: 'break', playerId, with: peer }
  if (type === ConcordatIntents.CloseTrade) {
    return peer === null ? null : { kind: 'closeTrade', playerId, with: peer }
  }
  if (type === ConcordatIntents.Target) {
    return peer === null ? null : { kind: 'target', playerId, with: peer }
  }
  if (type === ConcordatIntents.Emoji) {
    const emoji = whole(raw.emoji, 255)

    return peer === null || emoji === null ? null : { kind: 'emoji', playerId, to: peer, emoji }
  }
  if (type === ConcordatIntents.Embargo) {
    return peer === null ? null : { kind: 'embargo', playerId, with: peer, on: raw.on !== false }
  }
  if (type === ConcordatIntents.Aid) {
    const percent = whole(raw.percent, 100)

    return peer === null || percent === null ? null : { kind: 'aid', playerId, to: peer, percent }
  }
  if (type === ConcordatIntents.Gift) {
    const amount = whole(raw.amount, 1_000_000)
    const resource = raw.resource === 'gold' || raw.resource === 'troops' ? raw.resource : null

    return peer === null || amount === null || !resource
      ? null
      : { kind: 'gift', playerId, to: peer, resource, amount }
  }

  return null
}

/**
 * Command of a player from a request body, nothing else is read
 * @param {number} playerId - Nation of the sender
 * @param {Record<string, unknown>} raw - Body
 * @return {ConcordatIntent | typeof CONCORDAT_RESYNC | null} - Command, null when unreadable
 */

export const intentFromBody = (
  playerId: number,
  raw: Record<string, unknown>
): ConcordatIntent | typeof CONCORDAT_RESYNC | null => {
  if (raw.type === CONCORDAT_RESYNC) return CONCORDAT_RESYNC

  // Targets are nations, tiles stay inside a 32 bit index
  if (raw.type === ConcordatIntents.Engage) {
    const target = whole(raw.target, 255)
    const percent = whole(raw.percent, 100)
    const tile = raw.tile === undefined ? undefined : whole(raw.tile, ID_MAX)

    return target === null || percent === null || tile === null
      ? null
      : { kind: 'engage', playerId, target, percent, tile }
  }
  if (raw.type === ConcordatIntents.Feint) {
    const target = whole(raw.target, 255)
    const percent = whole(raw.percent, 100)

    return target === null || percent === null ? null : { kind: 'feint', playerId, target, percent }
  }
  if (raw.type === ConcordatIntents.Defend) {
    const target = whole(raw.target, 255)
    const percent = whole(raw.percent, 100)

    return target === null || percent === null
      ? null
      : { kind: 'defend', playerId, target, percent }
  }
  if (raw.type === ConcordatIntents.Retreat) {
    const target = whole(raw.target, 255)

    return target === null ? null : { kind: 'retreat', playerId, target }
  }
  if (raw.type === ConcordatIntents.PlaceStart) {
    const tile = whole(raw.tile, ID_MAX)

    return tile === null ? null : { kind: 'placeStart', playerId, tile }
  }

  return systemIntent(playerId, raw)
}
