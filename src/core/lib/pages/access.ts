import { PAGE_LEVELS, PageLevels, PageShareScopes } from '@/declarations/pages/access'
import type {
  GrantableLevelName,
  PageCapability,
  PageLevelName,
  PageShareScopeName,
} from '@/declarations/pages/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Member asking for a page
 * @typedef {Object} PageViewer
 * @property {string} id - Account id
 * @property {MemberRoleName} role - Hierarchy level
 */

export interface PageViewer {
  id: string
  role: MemberRoleName
}

/**
 * Share as the resolver reads it
 * @typedef {Object} GrantRule
 * @property {PageShareScopeName} scope - Audience
 * @property {string | null} accountId - Account reached
 * @property {MemberRoleName | null} role - Level reached
 * @property {GrantableLevelName} level - Level handed out
 */

export interface GrantRule {
  scope: PageShareScopeName
  accountId: string | null
  role: MemberRoleName | null
  level: GrantableLevelName
}

/**
 * One page of an ancestry chain
 * @typedef {Object} AccessNode
 * @property {string} id - Page id
 * @property {string} ownerId - Owner
 * @property {boolean} inheritAccess - Takes the parent shares
 * @property {GrantRule[]} grants - Own shares
 */

export interface AccessNode {
  id: string
  ownerId: string
  inheritAccess: boolean
  grants: GrantRule[]
}

/**
 * Stronger of two levels
 * @param {PageLevelName | null} left - One level
 * @param {PageLevelName | null} right - Other level
 * @return {PageLevelName | null} - Stronger level
 */

export const strongerLevel = (
  left: PageLevelName | null,
  right: PageLevelName | null
): PageLevelName | null => {
  if (!left) return right
  if (!right) return left

  return PAGE_LEVELS.get(left).rank >= PAGE_LEVELS.get(right).rank ? left : right
}

/**
 * Share reaches a member
 * @param {GrantRule} grant - Share
 * @param {PageViewer} viewer - Member asking
 * @return {boolean} - Reached
 */

export const grantReaches = (grant: GrantRule, viewer: PageViewer): boolean => {
  if (grant.scope === PageShareScopes.Workspace) return true
  if (grant.scope === PageShareScopes.Role) return grant.role === viewer.role

  return grant.accountId === viewer.id
}

/**
 * Level of a member on a page, nothing by default
 * @param {AccessNode[]} chain - Page then its ancestors
 * @param {PageViewer} viewer - Member asking
 * @return {PageLevelName | null} - Effective level
 */

export const resolvePageLevel = (chain: AccessNode[], viewer: PageViewer): PageLevelName | null => {
  let level: PageLevelName | null = null

  for (const [index, node] of chain.entries()) {
    // Own page, an ancestor's owner gets full access
    if (node.ownerId === viewer.id) {
      return strongerLevel(level, index === 0 ? PageLevels.Owner : PageLevels.Full)
    }

    for (const grant of node.grants) {
      if (grantReaches(grant, viewer)) level = strongerLevel(level, grant.level)
    }

    // A closed page stops the climb
    if (!node.inheritAccess) break
  }

  return level
}

/**
 * Someone besides the page owner may open it
 * @param {AccessNode[]} chain - Page then its ancestors
 * @return {boolean} - Shared one way or another
 */

export const reachesOthers = (chain: AccessNode[]): boolean => {
  const ownerId = chain[0]?.ownerId

  for (const node of chain) {
    // Grant or another owner up the climb
    if (node.grants.length > 0 || node.ownerId !== ownerId) return true
    if (!node.inheritAccess) break
  }

  return false
}

/**
 * Level allows a gesture
 * @param {PageLevelName | null} level - Effective level
 * @param {PageCapability} capability - Gesture
 * @return {boolean} - Allowed
 */

export const levelAllows = (level: PageLevelName | null, capability: PageCapability): boolean =>
  level !== null && PAGE_LEVELS.get(level).capabilities.includes(capability)

/**
 * Level a sharer may hand out
 * @param {PageLevelName | null} sharer - Level of the sharer
 * @param {GrantableLevelName} level - Level handed out
 * @return {boolean} - Allowed
 */

export const canHandOut = (sharer: PageLevelName | null, level: GrantableLevelName): boolean =>
  levelAllows(sharer, 'share') &&
  PAGE_LEVELS.get(level).rank <= PAGE_LEVELS.get(sharer as PageLevelName).rank

/**
 * Unique key of a share audience
 * @param {Object} target - Audience
 * @param {PageShareScopeName} target.scope - Audience kind
 * @param {string | null} [target.accountId] - Account reached
 * @param {MemberRoleName | null} [target.role] - Level reached
 * @return {string} - Target key
 */

export const shareTargetKey = (target: {
  scope: PageShareScopeName
  accountId?: string | null
  role?: MemberRoleName | null
}): string => {
  if (target.scope === PageShareScopes.Workspace) return 'workspace'
  if (target.scope === PageShareScopes.Role) return `role:${target.role ?? ''}`

  return `account:${target.accountId ?? ''}`
}
