import nexus from '@/configurations/system/nexus.json'
import { readInteger, readNode } from '@/declarations/configurations/readers'

const db = readNode(nexus.db, 'system/nexus.db')
const system = readNode(nexus.system, 'system/nexus.system')
const game = readNode(nexus.game, 'system/nexus.game')
const realtime = readNode(nexus.realtime, 'system/nexus.realtime')

/**
 * Database module bounds
 * @type {{ searchMinLength: number, dependentDepth: number, checkRows: number }}
 */

export const NEXUS_DB = {
  searchMinLength: readInteger(db.searchMinLength, {
    path: 'system/nexus.db.searchMinLength',
    fallback: 2,
    min: 1,
    max: 10,
  }),
  dependentDepth: readInteger(db.dependentDepth, {
    path: 'system/nexus.db.dependentDepth',
    fallback: 3,
    min: 1,
    max: 5,
  }),
  checkRows: readInteger(db.checkRows, {
    path: 'system/nexus.db.checkRows',
    fallback: 200,
    min: 10,
    max: 5000,
  }),
}

/**
 * System module bounds
 * @type {{ queueRows: number, maintenanceNoticeSeconds: number, restartTimeoutMs: number }}
 */

export const NEXUS_SYSTEM = {
  queueRows: readInteger(system.queueRows, {
    path: 'system/nexus.system.queueRows',
    fallback: 50,
    min: 5,
    max: 500,
  }),
  maintenanceNoticeSeconds: readInteger(system.maintenanceNoticeSeconds, {
    path: 'system/nexus.system.maintenanceNoticeSeconds',
    fallback: 30,
    min: 0,
    max: 600,
  }),
  restartTimeoutMs: readInteger(system.restartTimeoutMs, {
    path: 'system/nexus.system.restartTimeoutMs',
    fallback: 15000,
    min: 1000,
    max: 60000,
  }),
}

/**
 * Game module bounds
 * @type {{ eventRows: number, turnRows: number, pauseMaxMinutes: number }}
 */

export const NEXUS_GAME = {
  eventRows: readInteger(game.eventRows, {
    path: 'system/nexus.game.eventRows',
    fallback: 50,
    min: 5,
    max: 500,
  }),
  turnRows: readInteger(game.turnRows, {
    path: 'system/nexus.game.turnRows',
    fallback: 50,
    min: 5,
    max: 500,
  }),
  pauseMaxMinutes: readInteger(game.pauseMaxMinutes, {
    path: 'system/nexus.game.pauseMaxMinutes',
    fallback: 240,
    min: 1,
    max: 1440,
  }),
}

/**
 * Realtime module bounds
 * @type {{ eventsPerAccount: number, eventsKeepMinutes: number, reconnectPerMinute: number }}
 */

export const NEXUS_REALTIME = {
  eventsPerAccount: readInteger(realtime.eventsPerAccount, {
    path: 'system/nexus.realtime.eventsPerAccount',
    fallback: 200,
    min: 10,
    max: 2000,
  }),
  eventsKeepMinutes: readInteger(realtime.eventsKeepMinutes, {
    path: 'system/nexus.realtime.eventsKeepMinutes',
    fallback: 15,
    min: 1,
    max: 120,
  }),
  reconnectPerMinute: readInteger(realtime.reconnectPerMinute, {
    path: 'system/nexus.realtime.reconnectPerMinute',
    fallback: 5,
    min: 2,
    max: 100,
  }),
}
