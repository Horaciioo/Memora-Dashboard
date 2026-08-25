export const SanctionKinds = {
  Delete: 'DELETE',
  Warn: 'WARN',
  Timeout: 'TIMEOUT',
  Ban: 'BAN',
} as const

export type SanctionKindName = (typeof SanctionKinds)[keyof typeof SanctionKinds]
