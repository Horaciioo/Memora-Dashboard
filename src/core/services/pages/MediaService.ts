import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PageViewer } from '@/core/lib/pages'
import { requirePage } from '@/core/services/pages/AccessService'
import { isPageId } from '@/core/services/pages/lookups'
import { readFileBytes, storeFile } from '@/core/services/system/FileService'
import { MEDIA_VISIBILITIES } from '@/declarations/system/storage'
import type { MediaDescriptor } from '@/core/lib/http/route'

/**
 * Picture held by a page
 * @typedef {Object} PageMediaView
 * @property {string} id - Media id
 * @property {string} url - Guarded address
 */

export interface PageMediaView {
  id: string
  url: string
}

/**
 * Store a picture on a page the member may write
 * @param {string} pageId - Page id
 * @param {PageViewer} viewer - Member uploading
 * @param {File} file - Uploaded file
 * @return {Promise<PageMediaView>} - Stored picture
 */

export const uploadPageMedia = async (
  pageId: unknown,
  viewer: PageViewer,
  file: File
): Promise<PageMediaView> => {
  const { page } = await requirePage(pageId, viewer, 'write')
  const stored = await storeFile('pages', file)

  const media = await prisma.pageMedia.create({
    data: { pageId: page.id, storageEntryId: stored.id, uploadedById: viewer.id },
    select: { id: true },
  })

  return { id: media.id, url: API_ROUTES.pageMedia(media.id) }
}

/**
 * Stored entry of a picture
 * @param {string} mediaId - Media id
 * @return {Promise<{ pageId: string, storageEntryId: string }>} - Entry
 */

const findMedia = async (mediaId: string): Promise<{ pageId: string; storageEntryId: string }> => {
  const media = isPageId(mediaId)
    ? await prisma.pageMedia.findUnique({
        where: { id: mediaId },
        select: { pageId: true, storageEntryId: true },
      })
    : null
  if (!media) throw notFound()

  return media
}

/**
 * Metadata of a picture, always private
 * @param {string} mediaId - Media id
 * @return {Promise<MediaDescriptor>} - Descriptor
 */

export const describePageMedia = async (mediaId: string): Promise<MediaDescriptor> => {
  const media = await findMedia(mediaId)
  const entry = await prisma.storageEntry.findUniqueOrThrow({
    where: { id: media.storageEntryId },
    select: { mimeType: true, updatedAt: true },
  })

  return {
    visibility: MEDIA_VISIBILITIES.Private,
    mimeType: entry.mimeType,
    etag: `"${mediaId}-${entry.updatedAt.getTime()}"`,
  }
}

/**
 * Refuse a picture of a page the member may not read
 * @param {string} mediaId - Media id
 * @param {PageViewer} viewer - Member asking
 * @return {Promise<void>} - Allowed
 */

export const authorizePageMedia = async (mediaId: string, viewer: PageViewer): Promise<void> => {
  const media = await findMedia(mediaId)
  await requirePage(media.pageId, viewer, 'read', { allowTrashed: true })
}

/**
 * Bytes of a picture
 * @param {string} mediaId - Media id
 * @return {Promise<Uint8Array>} - Stored bytes
 */

export const readPageMedia = async (mediaId: string): Promise<Uint8Array> =>
  readFileBytes((await findMedia(mediaId)).storageEntryId)
