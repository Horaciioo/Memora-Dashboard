'use server'

import { refresh } from 'next/cache'

import { writeActiveCreator, writeNavigationView } from '@/core/lib/auth/activeCreator'
import { forbidden } from '@/core/lib/errors'
import { pickableCreators, reachableViews } from '@/core/services/auth/ViewService'
import { requireUser } from '@/core/wrappers/requireUser'
import { isNavigationView } from '@/declarations/navigation'

/**
 * Switch the rail view
 * @param {string} view - Rail view
 * @return {Promise<void>} - Switched
 */

export async function switchView(view: string): Promise<void> {
  const { session } = await requireUser()

  // A view outside what the level unlocks is never written
  if (!isNavigationView(view) || !reachableViews(session).includes(view)) throw forbidden()

  await writeNavigationView(view)
  refresh()
}

/**
 * Pin the creator
 * @param {string | null} youtuberId - Creator identifier, null clearing it
 * @return {Promise<void>} - Pinned
 */

export async function pickCreator(youtuberId: string | null): Promise<void> {
  const { session, access } = await requireUser()

  if (youtuberId !== null) {
    const creators = await pickableCreators(session, access)

    // A creator outside the perimeter never becomes the one on screen
    if (!creators.some((creator) => creator.id === youtuberId)) throw forbidden()
  }

  await writeActiveCreator(youtuberId)
  refresh()
}
