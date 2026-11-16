import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatModes, ConcordatPowers } from '@/utils/constants/concordat'
import { rebuildDerived } from '@/core/lib/play/concordat/sim/tiles'
import { emptyArms, emptyEffects, emptyTech } from '@/core/lib/play/concordat/sim/fresh'
import type {
  ConcordatBuilding,
  ConcordatCoalition,
  ConcordatCorps,
  ConcordatEvent,
  ConcordatOffer,
  ConcordatRelation,
  ConcordatRoute,
  ConcordatSample,
  ConcordatShip,
  ConcordatMap,
  ConcordatPlayerState,
  ConcordatState,
  ConcordatArms,
  ConcordatDomination,
  ConcordatAircraft,
  ConcordatScar,
  ConcordatStrike,
  ConcordatTech,
  ConcordatWorld,
  ConcordatZone,
} from '@/types/concordat'

/**
 * Storable game, the map is kept apart
 * @typedef {Object} ConcordatSnapshot
 */

export interface ConcordatSnapshot {
  phase: ConcordatState['phase']
  tick: number
  speed: number
  pickEnd: number
  endTick: number
  protectionTicks: number
  rng: number
  nextCorpsId: number
  // Base64 of the owner layer
  owner: string
  players: (Omit<
    ConcordatPlayerState,
    'front' | 'kind' | 'name' | 'color' | 'capShare' | 'growthShare' | 'goldShare'
  > &
    Partial<
      Pick<
        ConcordatPlayerState,
        'kind' | 'name' | 'color' | 'capShare' | 'growthShare' | 'goldShare'
      >
    >)[]
  corps: ConcordatCorps[]
  // Systems, absent in games saved before they existed
  nextId?: number
  buildings?: ConcordatBuilding[]
  ships?: ConcordatShip[]
  relations?: ConcordatRelation[]
  offers?: ConcordatOffer[]
  routes?: ConcordatRoute[]
  coalitions?: ConcordatCoalition[]
  trust?: number[]
  history?: ConcordatSample[]
  log?: ConcordatEvent[]
  mode?: ConcordatState['mode']
  teamCount?: number
  teams?: number[]
  nextDrawAt?: number
  techs?: ConcordatTech[]
  strikes?: ConcordatStrike[]
  aircraft?: ConcordatAircraft[]
  scars?: ConcordatScar[]
  zones?: ConcordatZone[]
  arms?: ConcordatArms[]
  world?: ConcordatWorld
  domination?: ConcordatDomination
}

/**
 * Snapshot of a game
 * @param {ConcordatState} state - Game
 * @return {ConcordatSnapshot} - Snapshot
 */

export const exportState = (state: ConcordatState): ConcordatSnapshot => ({
  phase: state.phase,
  tick: state.tick,
  speed: state.speed,
  pickEnd: state.pickEnd,
  endTick: state.endTick,
  protectionTicks: state.protectionTicks,
  rng: state.rng,
  nextCorpsId: state.nextCorpsId,
  owner: Buffer.from(state.owner).toString('base64'),
  players: state.players.map(
    (player) =>
      Object.fromEntries(
        Object.entries(player).filter(([key]) => key !== 'front')
      ) as ConcordatSnapshot['players'][number]
  ),
  corps: state.corps.map((corps) => ({ ...corps })),
  nextId: state.nextId,
  buildings: structuredClone(state.buildings),
  ships: structuredClone(state.ships),
  relations: structuredClone(state.relations),
  offers: structuredClone(state.offers),
  routes: structuredClone(state.routes),
  coalitions: structuredClone(state.coalitions),
  trust: structuredClone(state.trust),
  history: structuredClone(state.history),
  log: structuredClone(state.log),
  mode: state.mode,
  teamCount: state.teamCount,
  teams: [...state.teams],
  nextDrawAt: state.nextDrawAt,
  techs: structuredClone(state.techs),
  strikes: structuredClone(state.strikes),
  aircraft: structuredClone(state.aircraft),
  scars: structuredClone(state.scars),
  zones: structuredClone(state.zones),
  arms: structuredClone(state.arms),
  world: structuredClone(state.world),
  domination: { ...state.domination },
})

/**
 * Game back from a snapshot
 * @param {ConcordatMap} map - Map
 * @param {ConcordatSnapshot} snapshot - Snapshot
 * @return {ConcordatState} - Game
 */

export const importState = (map: ConcordatMap, snapshot: ConcordatSnapshot): ConcordatState => {
  const state: ConcordatState = {
    map,
    phase: snapshot.phase,
    tick: snapshot.tick,
    speed: snapshot.speed,
    pickEnd: snapshot.pickEnd,
    endTick: snapshot.endTick,
    protectionTicks: snapshot.protectionTicks,
    rng: snapshot.rng,
    owner: new Uint8Array(Buffer.from(snapshot.owner, 'base64')),
    players: snapshot.players.map((player) => ({
      // Saves older than the powers are all seats
      kind: ConcordatPowers.Human,
      name: '',
      color: 0,
      capShare: 1,
      growthShare: 1,
      goldShare: 1,
      ...player,
      front: new Set<number>(),
    })),
    corps: snapshot.corps.map((corps) => ({ ...corps })),
    provinceCounts: new Uint16Array((snapshot.players.length + 1) * (map.provinces.length + 1)),
    nextCorpsId: snapshot.nextCorpsId,
    events: [],
    changed: [],
    nextId: snapshot.nextId ?? 1,
    buildings: snapshot.buildings ?? [],
    ships: snapshot.ships ?? [],
    relations: snapshot.relations ?? [],
    offers: snapshot.offers ?? [],
    routes: snapshot.routes ?? [],
    coalitions: snapshot.coalitions ?? [],
    trust: snapshot.trust ?? snapshot.players.map(() => CONCORDAT.diplomacy.trustStart),
    effects: snapshot.players.map(emptyEffects),
    history: snapshot.history ?? [],
    log: snapshot.log ?? [],
    mode: snapshot.mode ?? ConcordatModes.Free,
    teamCount: snapshot.teamCount ?? 0,
    teams: snapshot.teams ?? snapshot.players.map(() => 0),
    nextDrawAt: snapshot.nextDrawAt ?? 0,
    techs: snapshot.techs ?? snapshot.players.map(emptyTech),
    strikes: snapshot.strikes ?? [],
    aircraft: snapshot.aircraft ?? [],
    scars: snapshot.scars ?? [],
    zones: snapshot.zones ?? [],
    arms: snapshot.arms ?? snapshot.players.map(emptyArms),
    world: snapshot.world ?? { nextAt: 0, active: null, warned: [] },
    domination: snapshot.domination ?? { side: 0, since: 0 },
    isSystemsDirty: true,
    isOffersDirty: true,
  }
  rebuildDerived(state)

  return state
}
