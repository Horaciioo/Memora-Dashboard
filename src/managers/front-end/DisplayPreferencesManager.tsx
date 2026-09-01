'use client'

import { useEffect, useRef } from 'react'

import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useAppearanceStore } from '@/core/store/appearance'
import { useColorVisionStore } from '@/core/store/colorVision'
import { useThemeStore } from '@/core/store/theme'
import type { DisplayPreferences } from '@/types/auth'

export interface DisplayPreferencesManagerProps {
  preferences: DisplayPreferences | null
}

/**
 * Carry the display preferences between the account and the browser stores
 * @param {DisplayPreferences | null} preferences - Preferences stored on the account
 * @return {null} - No render
 */

export const DisplayPreferencesManager = ({ preferences }: DisplayPreferencesManagerProps) => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const fontScale = useAppearanceStore((state) => state.fontScale)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)
  const setColorVisionMode = useColorVisionStore((state) => state.setColorVisionMode)

  // What the account is known to hold, and whether the stores have caught up with it
  const persisted = useRef<DisplayPreferences | null>(null)
  const settled = useRef(false)

  useEffect(() => {
    if (persisted.current || !preferences) return

    // The account wins on a browser that never chose, the stores own it afterwards
    if (preferences.theme) setTheme(preferences.theme)
    if (preferences.fontScale) setFontScale(preferences.fontScale)
    if (preferences.colorVision) setColorVisionMode(preferences.colorVision)

    persisted.current = {
      theme: preferences.theme ?? theme,
      fontScale: preferences.fontScale ?? fontScale,
      colorVision: preferences.colorVision ?? colorVisionMode,
    }
  }, [colorVisionMode, fontScale, preferences, setColorVisionMode, setFontScale, setTheme, theme])

  useEffect(() => {
    const known = persisted.current
    if (!known) return

    const matches =
      known.theme === theme &&
      known.fontScale === fontScale &&
      known.colorVision === colorVisionMode

    // A seeded value must land before a later change can be told apart from it
    if (!settled.current) {
      settled.current = matches
      return
    }

    if (matches) return

    persisted.current = { theme, fontScale, colorVision: colorVisionMode }

    // A failed write only costs this browser its carry-over, never the session
    void apiPatch(API_ROUTES.displayPreferences, {
      theme,
      fontScale,
      colorVision: colorVisionMode,
    }).catch(() => undefined)
  }, [colorVisionMode, fontScale, theme])

  return null
}
