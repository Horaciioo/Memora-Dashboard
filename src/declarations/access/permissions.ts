import { createRegistry } from '@/core/lib/registry'
import { PermissionGroups, PermissionsList } from '@/utils/constants/permissions'
import type { PermissionGroup, PermissionMeta } from '@/utils/constants/permissions'

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

const PERMISSION_GROUP_MAP: Record<PermissionGroup, PermissionGroupOption> = {
  [PermissionGroups.Members]: { label: 'Modérateurs', position: 0 },
  [PermissionGroups.Projects]: { label: 'Projets', position: 1 },
  [PermissionGroups.Tasks]: { label: 'Tâches', position: 2 },
  [PermissionGroups.Meetings]: { label: 'Réunions', position: 3 },
  [PermissionGroups.Absences]: { label: 'Absences', position: 4 },
  [PermissionGroups.Livecon]: { label: 'Livecon', position: 5 },
  [PermissionGroups.Academy]: { label: 'Marsha Academy', position: 6 },
  [PermissionGroups.Teams]: { label: 'Équipes', position: 7 },
  [PermissionGroups.Calendar]: { label: 'Calendrier', position: 8 },
  [PermissionGroups.Settings]: { label: 'Configuration', position: 9 },
}

export const PERMISSION_GROUP_REGISTRY = createRegistry(PERMISSION_GROUP_MAP)

/**
 * Grouped permission section
 * @typedef {Object} PermissionSection
 * @property {PermissionGroup} group - Group key
 * @property {string} label - Group label
 * @property {PermissionMeta[]} permissions - Permissions inside the group
 */

export interface PermissionSection {
  group: PermissionGroup
  label: string
  permissions: PermissionMeta[]
}

/**
 * Permission catalogue by group
 * @type {PermissionSection[]}
 */

export const PERMISSION_SECTIONS: PermissionSection[] = PERMISSION_GROUP_REGISTRY.keys
  .slice()
  .sort(
    (left, right) =>
      PERMISSION_GROUP_REGISTRY.get(left).position - PERMISSION_GROUP_REGISTRY.get(right).position
  )
  .map((group) => ({
    group,
    label: PERMISSION_GROUP_REGISTRY.get(group).label,
    permissions: PermissionsList.filter((entry) => entry.group === group),
  }))
