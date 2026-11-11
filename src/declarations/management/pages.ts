import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

// Root of the management area
export const MANAGEMENT_BASE = '/management'

export const ManagementPages = {
  Absences: 'absences',
  Networks: 'networks',
  Notes: 'notes',
  Birthdays: 'birthdays',
  Arrivals: 'arrivals',
  Functions: 'functions',
} as const

/**
 * Management sub-page key
 * @type {(typeof ManagementPages)[keyof typeof ManagementPages]}
 */

export type ManagementPageName = (typeof ManagementPages)[keyof typeof ManagementPages]

/**
 * Sub-page of the management area
 * @typedef {Object} ManagementPage
 * @property {ManagementPageName} key - Page key, also its path segment
 * @property {string} label - Rail label
 * @property {PermissionName} permission - Permission opening the page
 */

export interface ManagementPage {
  key: ManagementPageName
  label: string
  permission: PermissionName
}

/**
 * Sub-pages, in rail order
 * @type {ManagementPage[]}
 */

export const MANAGEMENT_PAGES: ManagementPage[] = [
  {
    key: ManagementPages.Absences,
    label: 'Absences',
    permission: Permissions.AbsenceReview,
  },
  {
    key: ManagementPages.Networks,
    label: 'Réseaux',
    permission: Permissions.MemberRead,
  },
  {
    key: ManagementPages.Notes,
    label: 'Notes',
    permission: Permissions.MemberNoteRead,
  },
  {
    key: ManagementPages.Birthdays,
    label: 'Anniversaires',
    permission: Permissions.MemberRead,
  },
  {
    key: ManagementPages.Arrivals,
    label: 'Arrivées',
    permission: Permissions.MemberRead,
  },
  {
    key: ManagementPages.Functions,
    label: 'Fonctions',
    permission: Permissions.MemberRead,
  },
]

/**
 * Path of a sub-page
 * @param {ManagementPageName} key - Page key
 * @return {string} - Route
 */

export const managementHref = (key: ManagementPageName): string => `${MANAGEMENT_BASE}/${key}`

/**
 * Declaration of a sub-page
 * @param {ManagementPageName} key - Page key
 * @return {ManagementPage} - Its declaration
 */

export const managementPage = (key: ManagementPageName): ManagementPage =>
  MANAGEMENT_PAGES.find((page) => page.key === key)!
