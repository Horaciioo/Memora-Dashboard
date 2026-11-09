import 'server-only'

import type { Metadata } from 'next'

import { currentWorkViewer } from '@/core/services/work/visibility'

type WorkViewer = NonNullable<Awaited<ReturnType<typeof currentWorkViewer>>>

/**
 * Title of a work file, hidden files lend none
 * @param {string} fallback - Generic title
 * @param {(viewer: WorkViewer) => Promise<string>} read - Checked title read
 * @return {Promise<Metadata>} - Page metadata
 */

export const workFileMetadata = async (
  fallback: string,
  read: (viewer: WorkViewer) => Promise<string>
): Promise<Metadata> => {
  try {
    const viewer = await currentWorkViewer()
    if (!viewer) return { title: fallback }

    return { title: await read(viewer) }
  } catch {
    return { title: fallback }
  }
}
