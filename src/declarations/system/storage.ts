import { createRegistry } from '@/core/lib/registry'
import { FILE_SETTINGS } from '@/declarations/configurations/settings'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Whether stored bytes are reachable without a session
 * @type {Record<string, string>}
 */

export const MEDIA_VISIBILITIES = {
  Public: 'public',
  Private: 'private',
} as const

export type MediaVisibility = (typeof MEDIA_VISIBILITIES)[keyof typeof MEDIA_VISIBILITIES]

/**
 * Response headers shared by every media route
 * @type {{ publicCacheControl: string, privateCacheControl: string, contentTypeOptions: string }}
 */

export const MEDIA_HEADERS = {
  publicCacheControl: 'public, max-age=31536000, immutable',
  privateCacheControl: 'private, max-age=0, must-revalidate',
  contentTypeOptions: 'nosniff',
}

/**
 * Storage bucket metadata
 * @typedef {Object} StorageBucketOption
 * @property {string} label - Display name
 * @property {boolean} unique - One object per key
 * @property {MediaVisibility} visibility - Reachable without a session
 * @property {number} maxBytes - Upload ceiling
 * @property {PermissionName} [readPermission] - Permission needed when private
 * @property {PermissionName} [writePermission] - Permission needed to upload
 */

interface StorageBucketOption {
  label: string
  unique: boolean
  visibility: MediaVisibility
  maxBytes: number
  readPermission?: PermissionName
  writePermission?: PermissionName
}

/**
 * Storage buckets
 * @type {Record<string, StorageBucketOption>}
 */

const STORAGE_BUCKET_MAP = {
  files: {
    label: 'Files',
    unique: false,
    visibility: MEDIA_VISIBILITIES.Private,
    maxBytes: FILE_SETTINGS.maxBytes,
    readPermission: Permissions.MemberRead,
    writePermission: Permissions.ReferenceManage,
  },
  avatars: {
    label: 'Avatars',
    unique: false,
    visibility: MEDIA_VISIBILITIES.Public,
    maxBytes: FILE_SETTINGS.maxBytes,
  },
  banners: {
    label: 'Banners',
    unique: false,
    visibility: MEDIA_VISIBILITIES.Public,
    maxBytes: FILE_SETTINGS.maxBytes,
  },
} satisfies Record<string, StorageBucketOption>

export const STORAGE_BUCKETS = createRegistry<keyof typeof STORAGE_BUCKET_MAP, StorageBucketOption>(
  STORAGE_BUCKET_MAP
)
