/**
 * Access change signal
 * @type {{ topic: string, event: string, settleMs: number, writes: ReadonlySet<string>, watched: Record<string, readonly string[] | true> }}
 */

export const ACCESS_SIGNAL = {
  // Bus topic and stream event name
  topic: 'access:changed',
  event: 'access',
  // Writes landing together send one signal
  settleMs: 400,
  // Operations that change data
  writes: new Set([
    'create',
    'createMany',
    'createManyAndReturn',
    'update',
    'updateMany',
    'updateManyAndReturn',
    'upsert',
    'delete',
    'deleteMany',
  ]),
  // Models that move what a member can see, true for any write, else the fields that matter
  watched: {
    RolePermission: true,
    FunctionPermission: true,
    AccountPermission: true,
    AccountFunction: true,
    JobFunction: true,
    Account: ['role', 'status', 'frozenAt', 'divisionId', 'youtubers', 'functions', 'permissions'],
  },
} as const
