import 'server-only'

import adminIdentity from '@/configurations/system/identifiant.admin.json'
import { readBoolean, readInteger, readString } from '@/declarations/configurations/readers'
import { MemberRoles, type MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Root administrator profile
 * @typedef {Object} RootIdentity
 * @property {string | null} discordId - Identifier from the environment
 * @property {string} displayName - Display name
 * @property {MemberRoleName} role - Hierarchy level
 * @property {boolean} immutable - Never editable nor deletable
 * @property {number} sessionDays - Session lifetime
 */

export interface RootIdentity {
  discordId: string | null
  displayName: string
  role: MemberRoleName
  immutable: boolean
  sessionDays: number
}

// Identifier never lives in the configuration file
const discordId = process.env.ADMIN_DISCORD_ID?.trim() ?? ''

const role = readString(adminIdentity.role, {
  path: 'system/identifiant.admin.role',
  fallback: MemberRoles.Admin,
})

/**
 * Root administrator identity
 * @type {RootIdentity}
 */

export const ROOT_IDENTITY: RootIdentity = {
  discordId: discordId.length > 0 ? discordId : null,
  displayName: readString(adminIdentity.displayName, {
    path: 'system/identifiant.admin.displayName',
    fallback: 'Administrateur',
  }),
  role: role === MemberRoles.Admin ? MemberRoles.Admin : (role as MemberRoleName),
  immutable: readBoolean(adminIdentity.immutable, {
    path: 'system/identifiant.admin.immutable',
    fallback: true,
  }),
  sessionDays: readInteger(adminIdentity.sessionDays, {
    path: 'system/identifiant.admin.sessionDays',
    fallback: 14,
    min: 1,
    max: 90,
  }),
}

/**
 * Check root identifier
 * @param {string | null | undefined} discordIdentifier - Candidate identifier
 * @return {boolean} - Is the root administrator
 */

export const isRootIdentity = (discordIdentifier: string | null | undefined): boolean =>
  ROOT_IDENTITY.discordId !== null && discordIdentifier === ROOT_IDENTITY.discordId
