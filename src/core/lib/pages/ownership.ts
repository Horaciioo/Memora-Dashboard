import { isEncadrement } from '@/declarations/access/roles'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Own pages are for responsables and above, guests only open what is shared
 * @param {{ role: MemberRoleName, isRoot?: boolean } | null} member - Signed-in member
 * @return {boolean} - May create pages
 */

export const canOwnPages = (member: { role: MemberRoleName; isRoot?: boolean } | null): boolean =>
  !!member && (!!member.isRoot || isEncadrement(member.role))
