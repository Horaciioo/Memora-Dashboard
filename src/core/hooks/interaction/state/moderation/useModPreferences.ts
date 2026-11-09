'use client'

import { useEffect, useSyncExternalStore } from 'react'

import {
  commitPreview,
  discardPreview,
  previewPreferences,
  readApplied,
  selectProfile,
  subscribePreferences,
  updatePreferences,
} from '@/core/lib/modview/preferenceStore'
import { MODVIEW_DEFAULTS } from '@/core/lib/modview/preferences'

/**
 * Moderator preferences, shared by every window and kept on the server
 * @return {Object} - Applied values and their three gestures
 */

export const useModPreferences = () => ({
  preferences: useSyncExternalStore(subscribePreferences, readApplied, () => MODVIEW_DEFAULTS),
  update: updatePreferences,
  preview: previewPreferences,
  commit: commitPreview,
  discard: discardPreview,
})

/**
 * Load the profile of a live
 * @param {string | null} liveId - Live, null for the account
 * @return {void}
 */

export const useModPreferenceProfile = (liveId: string | null): void => {
  useEffect(() => {
    void selectProfile(liveId)
  }, [liveId])
}
