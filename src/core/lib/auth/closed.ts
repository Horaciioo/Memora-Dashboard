import { GONE_MEMBER_STATUSES } from '@/utils/constants/hierarchy'
import type { MemberStatusName } from '@/utils/constants/hierarchy'

/**
 * Account no longer opens a session
 * @param {Object} account - Account row
 * @param {MemberStatusName} account.status - Lifecycle
 * @param {Date | null} account.frozenAt - Freeze moment
 * @return {boolean} - Access shut
 */

export const isAccessClosed = (account: {
  status: MemberStatusName
  frozenAt: Date | null
}): boolean => GONE_MEMBER_STATUSES.includes(account.status) || account.frozenAt !== null
