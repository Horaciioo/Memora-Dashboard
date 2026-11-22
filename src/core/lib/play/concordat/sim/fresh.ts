import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type {
  ConcordatArms,
  ConcordatEffects,
  ConcordatState,
  ConcordatTech,
} from '@/types/concordat'
import { CONCORDAT_TECH_ORDER, ConcordatModes } from '@/utils/constants/concordat'

type SystemsFields = Pick<
  ConcordatState,
  | 'nextId'
  | 'mode'
  | 'teamCount'
  | 'teams'
  | 'nextDrawAt'
  | 'techs'
  | 'strikes'
  | 'aircraft'
  | 'scars'
  | 'zones'
  | 'arms'
  | 'world'
  | 'domination'
  | 'buildings'
  | 'ships'
  | 'relations'
  | 'offers'
  | 'routes'
  | 'trust'
  | 'embargoes'
  | 'traitors'
  | 'mirvs'
  | 'targets'
  | 'emojis'
  | 'effects'
  | 'history'
  | 'log'
  | 'isSystemsDirty'
  | 'isOffersDirty'
>

/**
 * Effects of a nation with nothing built
 * @return {ConcordatEffects} - Effects
 */

export const emptyEffects = (): ConcordatEffects => ({
  gold: 0,
  cap: 0,
  growth: 0,
  calm: 0,
  upkeep: 0,
  ships: 0,
  fortresses: [],
  trade: 0,
  income: 1,
  defense: 0,
  intercept: 0,
  shipSpeed: 0,
  trustGain: 0,
  blockade: 0,
  upkeepCut: 0,
  canFeint: false,
  malus: 0,
})

/**
 * Research state of a nation with nothing learnt
 * @return {ConcordatTech} - Research
 */

export const emptyTech = (): ConcordatTech => ({
  levels: CONCORDAT_TECH_ORDER.map(() => 0),
  path: -1,
  readyAt: 0,
})

/**
 * Missiles of a nation with no silo
 * @return {ConcordatArms} - Arms
 */

export const emptyArms = (): ConcordatArms => ({ missiles: 0, heavy: 0, nextAt: 0 })

/**
 * Empty systems of a game with this many nations
 * @param {number} players - Nation count
 * @return {SystemsFields} - Fields
 */

export const freshSystems = (players: number): SystemsFields => ({
  nextId: 1,
  mode: ConcordatModes.Free,
  teamCount: 0,
  teams: Array.from({ length: players }, () => 0),
  nextDrawAt: 0,
  techs: Array.from({ length: players }, emptyTech),
  strikes: [],
  aircraft: [],
  scars: [],
  zones: [],
  arms: Array.from({ length: players }, emptyArms),
  world: { nextAt: 0, active: null, warned: [] },
  domination: { side: 0, since: 0 },
  buildings: [],
  ships: [],
  relations: [],
  offers: [],
  routes: [],
  trust: Array.from({ length: players }, () => CONCORDAT.diplomacy.trustStart),
  embargoes: [],
  traitors: Array.from({ length: players }, () => 0),
  targets: [],
  emojis: [],
  mirvs: 0,
  effects: Array.from({ length: players }, emptyEffects),
  history: [],
  log: [],
  isSystemsDirty: false,
  isOffersDirty: false,
})
