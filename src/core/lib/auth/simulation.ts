import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { VIEW_ROLES } from '@/declarations/access/views'
import type { NavigationViewName } from '@/declarations/navigation'
import type { ActualIdentity, SessionUser } from '@/types/auth'
import { ADMIN_ROLES, MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Rank of a level
 * @param {ActualIdentity} level - Real identity
 * @return {number} - Hierarchy rank
 */

const rankOf = ({ role, isRoot }: ActualIdentity): number =>
  ROLE_REGISTRY.get(isRoot ? MemberRoles.Admin : role).rank

/**
 * Role a view makes a member wear
 * @param {NavigationViewName | null} view - View chosen
 * @param {ActualIdentity} actual - Real identity
 * @return {MemberRoleName | null} - Null when nothing is simulated
 */

export const simulatedRoleOf = (
  view: NavigationViewName | null,
  actual: ActualIdentity
): MemberRoleName | null => {
  if (!view) return null

  const role = VIEW_ROLES[view]

  // A view never lifts the level
  return ROLE_REGISTRY.get(role).rank < rankOf(actual) ? role : null
}

/**
 * Check a simulated view
 * @param {SessionUser} session - Signed-in member
 * @return {boolean} - Wears a lower level
 */

export const isSimulated = (session: SessionUser): boolean =>
  session.role !== session.actual.role || session.isRoot !== session.actual.isRoot

/**
 * Check an administrator level
 * @param {ActualIdentity} actual - Real identity
 * @return {boolean} - Real administrator
 */

export const isActualAdmin = ({ role, isRoot }: ActualIdentity): boolean =>
  isRoot || ADMIN_ROLES.includes(role)
