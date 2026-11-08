export { syncRoleGrants } from '@/core/services/auth/GrantsService/sync'
export type { HolderAccount } from '@/core/services/auth/GrantsService/sync'
export {
  resolveAccountPermissions,
  readInheritedGrants,
} from '@/core/services/auth/GrantsService/resolve'
export {
  readRoleBaseline,
  readFunctionBaseline,
  replaceRoleGrants,
  replaceFunctionGrants,
  applyRolePreset,
  readRoleGrants,
  readFunctionGrants,
  simulateRoleGrants,
  simulateFunctionGrants,
} from '@/core/services/auth/GrantsService/grants'
export type { FunctionGrants } from '@/core/services/auth/GrantsService/grants'
