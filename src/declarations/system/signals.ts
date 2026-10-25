/**
 * Write signal
 * @typedef {Object} ChangeSignal
 * @property {string} topic - Bus topic
 * @property {string} event - Stream event name
 * @property {number} settleMs - Writes landing together send one signal
 * @property {ReadonlySet<string>} writes - Operations raising it
 * @property {Record<string, readonly string[] | true>} watched - Models raising it, true for any write, else the fields that matter
 */

export interface ChangeSignal {
  topic: string
  event: string
  settleMs: number
  writes: ReadonlySet<string>
  watched: Record<string, readonly string[] | true>
}

// Operations that create rows
const CREATIONS = ['create', 'createMany', 'createManyAndReturn']

// Operations that change data
const WRITES = [
  ...CREATIONS,
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
  'delete',
  'deleteMany',
]

/**
 * Access change signal, raised by any write that moves what a member can see
 * @type {ChangeSignal}
 */

export const ACCESS_SIGNAL: ChangeSignal = {
  topic: 'access:changed',
  event: 'access',
  settleMs: 400,
  writes: new Set(WRITES),
  watched: {
    RolePermission: true,
    FunctionPermission: true,
    AccountPermission: true,
    AccountFunction: true,
    JobFunction: true,
    Account: ['role', 'status', 'frozenAt', 'divisionId', 'youtubers', 'functions', 'permissions'],
  },
}

/**
 * Logs signal, raised each time a fact is written to the journal
 * @type {ChangeSignal}
 */

export const JOURNAL_SIGNAL: ChangeSignal = {
  topic: 'journal:written',
  event: 'journal',
  settleMs: 1000,
  writes: new Set(CREATIONS),
  watched: { ActivityLog: true },
}

/**
 * Every signal the database client raises
 * @type {ChangeSignal[]}
 */

export const CHANGE_SIGNALS: ChangeSignal[] = [ACCESS_SIGNAL, JOURNAL_SIGNAL]
