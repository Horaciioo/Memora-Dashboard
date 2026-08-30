import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { FILE_SETTINGS } from '@/declarations/configurations/settings'
import { FILE_COPY } from '@/declarations/ui/copy'
import { sniffMimeType } from '@/declarations/system/signatures'
import { STORAGE_BUCKETS } from '@/declarations/system/storage'
import type { MediaVisibility } from '@/declarations/system/storage'
import type { StorageBucket } from '@/types/storage'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Stored file, as the interface refers to it
 * @typedef {Object} StoredFile
 * @property {string} id - Entry identifier
 * @property {string} url - Route serving the bytes
 * @property {string} mimeType - Detected type
 * @property {number} byteSize - Byte length
 */

export interface StoredFile {
  id: string
  url: string
  mimeType: string
  byteSize: number
}

/**
 * Build the route serving one stored file
 * @param {string} id - Entry identifier
 * @return {string} - Public path
 */

export const fileUrl = (id: string): string => `/api/fichiers/${id}`

/**
 * Build the validator of one stored entry
 * @param {string} id - Entry identifier
 * @param {Date} updatedAt - Last write
 * @return {string} - Strong ETag
 */

const etagOf = (id: string, updatedAt: Date): string => `"${id}-${updatedAt.getTime()}"`

/**
 * Store an uploaded file, bounded by the declared size and type list
 * @param {StorageBucket} bucket - Declared bucket
 * @param {File} file - Uploaded file
 * @return {Promise<StoredFile>} - Stored file
 */

export const storeFile = async (bucket: StorageBucket, file: File): Promise<StoredFile> => {
  if (!STORAGE_BUCKETS.has(bucket)) throw invalidInput([], FILE_COPY.unknownBucket)

  const destination = STORAGE_BUCKETS.get(bucket)

  if (file.size > destination.maxBytes) {
    throw invalidInput([{ field: 'file', message: FILE_COPY.tooLarge }])
  }

  const data = Buffer.from(await file.arrayBuffer())

  // The declared type is a claim, the bytes are the evidence
  const mimeType = sniffMimeType(data)
  if (!FILE_SETTINGS.allowedTypes.includes(mimeType)) {
    throw invalidInput([{ field: 'file', message: FILE_COPY.wrongType }])
  }

  const entry = await prisma.storageEntry.create({
    data: {
      bucket,
      key: crypto.randomUUID(),
      mimeType,
      byteSize: data.byteLength,
      data,
      metadata: { name: file.name },
    },
    select: { id: true, mimeType: true, byteSize: true },
  })

  return { ...entry, url: fileUrl(entry.id) }
}

/**
 * What the media route needs before reading any byte
 * @typedef {Object} FileDescriptor
 * @property {MediaVisibility} visibility - Reachable without a session
 * @property {string} mimeType - Stored content type
 * @property {string} etag - Validator of the stored bytes
 * @property {PermissionName} [permission] - Permission needed when private
 */

export interface FileDescriptor {
  visibility: MediaVisibility
  mimeType: string
  etag: string
  permission?: PermissionName
}

/**
 * Read the metadata of one stored file
 * @param {string} id - Entry identifier
 * @return {Promise<FileDescriptor>} - Entry metadata
 */

export const describeFile = async (id: string): Promise<FileDescriptor> => {
  const entry = await prisma.storageEntry.findUnique({
    where: { id },
    select: { bucket: true, mimeType: true, updatedAt: true },
  })

  if (!entry || !STORAGE_BUCKETS.has(entry.bucket)) throw notFound()

  const destination = STORAGE_BUCKETS.get(entry.bucket)

  return {
    visibility: destination.visibility,
    mimeType: entry.mimeType,
    etag: etagOf(id, entry.updatedAt),
    ...(destination.readPermission ? { permission: destination.readPermission } : {}),
  }
}

/**
 * Read the bytes of one stored file
 * @param {string} id - Entry identifier
 * @return {Promise<Uint8Array>} - Stored bytes
 */

export const readFileBytes = async (id: string): Promise<Uint8Array> => {
  const entry = await prisma.storageEntry.findUnique({ where: { id }, select: { data: true } })
  if (!entry) throw notFound()

  return new Uint8Array(entry.data)
}

/**
 * Every column that may hold a stored file route
 * @type {((urls: string[]) => Promise<(string | null)[]>)[]}
 */

const FILE_REFERENCE_LOOKUPS = [
  async (urls: string[]) =>
    (
      await prisma.account.findMany({
        where: { avatarUrl: { in: urls } },
        select: { avatarUrl: true },
      })
    ).map((row) => row.avatarUrl),
  async (urls: string[]) =>
    (
      await prisma.youtuber.findMany({
        where: { avatarUrl: { in: urls } },
        select: { avatarUrl: true },
      })
    ).map((row) => row.avatarUrl),
  async (urls: string[]) =>
    (
      await prisma.platform.findMany({
        where: { avatarUrl: { in: urls } },
        select: { avatarUrl: true },
      })
    ).map((row) => row.avatarUrl),
  async (urls: string[]) =>
    (
      await prisma.division.findMany({
        where: { imagePath: { in: urls } },
        select: { imagePath: true },
      })
    ).map((row) => row.imagePath),
]

/**
 * Drop the entries no record ever referenced
 * @param {number} olderThanHours - Age before collection
 * @return {Promise<number>} - Removed count
 */

export const pruneOrphanFiles = async (olderThanHours: number): Promise<number> => {
  const horizon = new Date(Date.now() - olderThanHours * 3_600_000)

  const candidates = await prisma.storageEntry.findMany({
    where: { createdAt: { lt: horizon } },
    select: { id: true },
  })

  if (candidates.length === 0) return 0

  const urls = candidates.map((entry) => fileUrl(entry.id))
  const referenced = await Promise.all(FILE_REFERENCE_LOOKUPS.map((lookup) => lookup(urls)))

  const kept = new Set(referenced.flat().filter((url): url is string => url !== null))
  const removable = candidates.map((entry) => entry.id).filter((id) => !kept.has(fileUrl(id)))

  if (removable.length === 0) return 0

  const { count } = await prisma.storageEntry.deleteMany({ where: { id: { in: removable } } })

  return count
}
