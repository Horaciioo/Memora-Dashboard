import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { FILE_SETTINGS } from '@/declarations/configurations/settings'
import { FILE_COPY } from '@/declarations/ui/copy'
import { STORAGE_BUCKETS } from '@/declarations/system/storage'
import type { StorageBucket } from '@/types/storage'

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
 * Store an uploaded file, bounded by the declared size and type list
 * @param {StorageBucket} bucket - Declared bucket
 * @param {File} file - Uploaded file
 * @return {Promise<StoredFile>} - Stored file
 */

export const storeFile = async (bucket: StorageBucket, file: File): Promise<StoredFile> => {
  if (!STORAGE_BUCKETS.has(bucket)) throw invalidInput([], FILE_COPY.unknownBucket)

  if (file.size > FILE_SETTINGS.maxBytes) {
    throw invalidInput([{ field: 'file', message: FILE_COPY.tooLarge }])
  }

  if (!FILE_SETTINGS.allowedTypes.includes(file.type)) {
    throw invalidInput([{ field: 'file', message: FILE_COPY.wrongType }])
  }

  const data = Buffer.from(await file.arrayBuffer())

  const entry = await prisma.storageEntry.create({
    data: {
      bucket,
      key: crypto.randomUUID(),
      mimeType: file.type,
      byteSize: data.byteLength,
      data,
      metadata: { name: file.name },
    },
    select: { id: true, mimeType: true, byteSize: true },
  })

  return { ...entry, url: fileUrl(entry.id) }
}

/**
 * Read one stored file
 * @param {string} id - Entry identifier
 * @return {Promise<{ data: Uint8Array, mimeType: string }>} - Stored bytes
 */

export const readFile = async (id: string): Promise<{ data: Uint8Array; mimeType: string }> => {
  const entry = await prisma.storageEntry.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  })

  if (!entry) throw notFound()

  return { data: new Uint8Array(entry.data), mimeType: entry.mimeType }
}
