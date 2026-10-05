import { createRegistry } from '@/core/lib/registry'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { TWO_FACTOR_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'
import { PermissionGroups, PermissionsList } from '@/utils/constants/permissions'
import type { PermissionGroup, PermissionMeta } from '@/utils/constants/permissions'

// A fallback code is the longest thing the field ever takes
const RECOVERY_CODE_LENGTH = TWO_FACTOR_SETTINGS.recoveryCodeBytes * 2

/**
 * Permission group metadata
 * @typedef {Object} PermissionGroupOption
 * @property {string} label - Display name
 * @property {number} position - Display order
 */

interface PermissionGroupOption {
  label: string
  position: number
}

// One entry per navigation page
const PERMISSION_GROUP_MAP: Record<PermissionGroup, PermissionGroupOption> = {
  [PermissionGroups.Members]: { label: 'Modérateurs', position: 0 },
  [PermissionGroups.Projects]: { label: 'Projets', position: 1 },
  [PermissionGroups.Tasks]: { label: 'Tâches', position: 2 },
  [PermissionGroups.Meetings]: { label: 'Réunions', position: 3 },
  [PermissionGroups.Absences]: { label: 'Absences', position: 4 },
  [PermissionGroups.Calendar]: { label: 'Calendrier', position: 5 },
  [PermissionGroups.Livecon]: { label: 'Livecon', position: 6 },
  [PermissionGroups.Live]: { label: 'Lives & Mod View', position: 7 },
  [PermissionGroups.Sanctions]: { label: 'Panel de sanctions', position: 8 },
  [PermissionGroups.Recruitment]: { label: 'Recrutements', position: 9 },
  [PermissionGroups.Academy]: { label: 'Marsha Academy', position: 10 },
  [PermissionGroups.Legacy]: { label: 'Legacy', position: 11 },
  [PermissionGroups.Teams]: { label: 'Équipes', position: 12 },
  [PermissionGroups.Configuration]: { label: 'Configuration', position: 13 },
  [PermissionGroups.Access]: { label: 'Accès & console', position: 14 },
}

export const PERMISSION_GROUP_REGISTRY = createRegistry(PERMISSION_GROUP_MAP)

/**
 * Page permission and its refinements
 * @typedef {Object} PermissionRoot
 * @property {PermissionMeta} meta - Page permission
 * @property {PermissionMeta[]} children - Refinements nested under it
 */

export interface PermissionRoot {
  meta: PermissionMeta
  children: PermissionMeta[]
}

/**
 * Grouped permission section
 * @typedef {Object} PermissionSection
 * @property {PermissionGroup} group - Group key
 * @property {string} label - Group label
 * @property {PermissionMeta[]} permissions - Every permission of the page
 * @property {PermissionRoot[]} roots - Page permissions with their refinements
 */

export interface PermissionSection {
  group: PermissionGroup
  label: string
  permissions: PermissionMeta[]
  roots: PermissionRoot[]
}

/**
 * Permission catalogue by page
 * @type {PermissionSection[]}
 */

export const PERMISSION_SECTIONS: PermissionSection[] = PERMISSION_GROUP_REGISTRY.keys
  .slice()
  .sort(
    (left, right) =>
      PERMISSION_GROUP_REGISTRY.get(left).position - PERMISSION_GROUP_REGISTRY.get(right).position
  )
  .map((group) => {
    const permissions = PermissionsList.filter((entry) => entry.group === group)

    // Rootless entries carry the page
    const roots = permissions
      .filter((entry) => !entry.parent)
      .map((meta) => ({
        meta,
        children: permissions.filter((entry) => entry.parent === meta.name),
      }))

    return { group, label: PERMISSION_GROUP_REGISTRY.get(group).label, permissions, roots }
  })

/**
 * Second factor code field
 * @type {FieldDefinition}
 */

export const codeField: FieldDefinition = {
  name: 'code',
  kind: 'text',
  label: TWO_FACTOR_COPY.codeLabel,
  placeholder: TWO_FACTOR_COPY.codePlaceholder,
  required: true,
  maxLength: RECOVERY_CODE_LENGTH,
}
