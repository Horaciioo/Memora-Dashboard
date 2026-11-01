import { createRegistry } from '@/core/lib/registry'
import { PAGE_ACCESS_COPY } from '@/declarations/pages/copy'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Gesture a level may perform on a page
 * @type {Record<string, string>}
 */

export const PageCapabilities = {
  Read: 'read',
  Comment: 'comment',
  Write: 'write',
  Organize: 'organize',
  Share: 'share',
  Trash: 'trash',
} as const

export type PageCapability = (typeof PageCapabilities)[keyof typeof PageCapabilities]

/**
 * Level a member holds on a page
 * @type {Record<string, string>}
 */

export const PageLevels = {
  Owner: 'OWNER',
  Full: 'FULL',
  Edit: 'EDIT',
  Comment: 'COMMENT',
  View: 'VIEW',
} as const

export type PageLevelName = (typeof PageLevels)[keyof typeof PageLevels]

// Levels a share may hand out
export type GrantableLevelName = Exclude<PageLevelName, 'OWNER'>

/**
 * Level metadata
 * @typedef {Object} PageLevelOption
 * @property {string} label - Display name
 * @property {string} description - What it opens
 * @property {number} rank - Strength
 * @property {PageCapability[]} capabilities - Gestures allowed
 */

interface PageLevelOption {
  label: string
  description: string
  rank: number
  capabilities: PageCapability[]
}

const EVERY_CAPABILITY = Object.values(PageCapabilities)

const PAGE_LEVEL_MAP: Record<PageLevelName, PageLevelOption> = {
  OWNER: {
    label: PAGE_ACCESS_COPY.owner,
    description: PAGE_ACCESS_COPY.ownerHint,
    rank: 4,
    capabilities: EVERY_CAPABILITY,
  },
  FULL: {
    label: PAGE_ACCESS_COPY.full,
    description: PAGE_ACCESS_COPY.fullHint,
    rank: 3,
    capabilities: EVERY_CAPABILITY,
  },
  EDIT: {
    label: PAGE_ACCESS_COPY.edit,
    description: PAGE_ACCESS_COPY.editHint,
    rank: 2,
    capabilities: [PageCapabilities.Read, PageCapabilities.Comment, PageCapabilities.Write],
  },
  COMMENT: {
    label: PAGE_ACCESS_COPY.comment,
    description: PAGE_ACCESS_COPY.commentHint,
    rank: 1,
    capabilities: [PageCapabilities.Read, PageCapabilities.Comment],
  },
  VIEW: {
    label: PAGE_ACCESS_COPY.view,
    description: PAGE_ACCESS_COPY.viewHint,
    rank: 0,
    capabilities: [PageCapabilities.Read],
  },
}

export const PAGE_LEVELS = createRegistry<PageLevelName, PageLevelOption>(PAGE_LEVEL_MAP)

/**
 * Levels a share offers, strongest first
 * @type {GrantableLevelName[]}
 */

export const GRANTABLE_LEVELS: GrantableLevelName[] = ['FULL', 'EDIT', 'COMMENT', 'VIEW']

/**
 * Level a new share starts on
 * @type {GrantableLevelName}
 */

export const DEFAULT_GRANT_LEVEL: GrantableLevelName = 'EDIT'

/**
 * Audience of a share
 * @type {Record<string, string>}
 */

export const PageShareScopes = {
  Workspace: 'WORKSPACE',
  Role: 'ROLE',
  Account: 'ACCOUNT',
} as const

export type PageShareScopeName = (typeof PageShareScopes)[keyof typeof PageShareScopes]

/**
 * Capability labels, read as the permission matrix
 * @type {Record<PageCapability, { label: string, icon: IconName }>}
 */

export const PAGE_CAPABILITY_LABELS: Record<PageCapability, { label: string; icon: IconName }> = {
  read: { label: PAGE_ACCESS_COPY.capabilityRead, icon: 'visible' },
  comment: { label: PAGE_ACCESS_COPY.capabilityComment, icon: 'chat' },
  write: { label: PAGE_ACCESS_COPY.capabilityWrite, icon: 'edit' },
  organize: { label: PAGE_ACCESS_COPY.capabilityOrganize, icon: 'drag' },
  share: { label: PAGE_ACCESS_COPY.capabilityShare, icon: 'lock' },
  trash: { label: PAGE_ACCESS_COPY.capabilityTrash, icon: 'remove' },
}
