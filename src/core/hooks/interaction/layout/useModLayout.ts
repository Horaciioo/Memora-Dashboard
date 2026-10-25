'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  allowSpec,
  buildLayout,
  isLayout,
  moveWindow,
  reconcileLayout,
  resizeColumns,
  resizeWindows,
  scaleColumn,
  scaleWindow,
  toggleFold,
  toggleMaximize,
} from '@/core/lib/modview/layout'
import type { DropSpot, ModLayout } from '@/core/lib/modview/layout'
import { MODVIEW_PROFILES } from '@/declarations/modview/profiles'
import type { ModViewProfileName } from '@/declarations/modview/profiles'
import type { ModViewWindow } from '@/types/modview'

// One save per seat, kept in this browser
const storageKey = (profile: ModViewProfileName) => `memora:modview:layout:v4:${profile}`

/**
 * Saved arrangement
 * @typedef {Object} SavedWorkspace
 * @property {ModLayout} layout - Windows placed
 * @property {ModViewWindow[]} hidden - Windows closed
 */

interface SavedWorkspace {
  layout: ModLayout
  hidden: ModViewWindow[]
}

/**
 * Read the save of a seat
 * @param {ModViewProfileName} profile - Seat
 * @return {SavedWorkspace | null} - Save
 */

const readSave = (profile: ModViewProfileName): SavedWorkspace | null => {
  try {
    const raw = window.localStorage.getItem(storageKey(profile))
    const parsed = (raw ? JSON.parse(raw) : null) as Partial<SavedWorkspace> | null
    // A damaged save is dropped, never drawn
    if (!isLayout(parsed?.layout) || !Array.isArray(parsed.hidden)) return null

    return { layout: parsed.layout, hidden: parsed.hidden.filter((id) => typeof id === 'string') }
  } catch {
    return null
  }
}

/**
 * Keep the arrangement of a seat
 * @param {ModViewProfileName} profile - Seat
 * @param {SavedWorkspace} save - Arrangement
 * @return {void}
 */

const writeSave = (profile: ModViewProfileName, save: SavedWorkspace): void => {
  try {
    window.localStorage.setItem(storageKey(profile), JSON.stringify(save))
  } catch {
    // The arrangement simply lasts for the visit
  }
}

/**
 * Arrangement of the Mod View windows of a seat: placed, sized, folded or hidden, kept in the browser
 * @param {ModViewProfileName} profile - Seat
 * @param {ModViewWindow[]} available - Windows the platform exposes
 * @return {Object} - Layout and its gestures
 */

export const useModLayout = (profile: ModViewProfileName, available: ModViewWindow[]) => {
  const seat = MODVIEW_PROFILES.get(profile)
  const starting = useMemo(() => {
    const allowed = seat.windows.filter((id) => available.includes(id))

    return buildLayout(allowSpec(seat.columns, allowed), seat.widths, seat.sizes)
  }, [seat, available])

  const [state, setState] = useState<SavedWorkspace>({ layout: starting, hidden: seat.hidden })
  const [isLoaded, setLoaded] = useState(false)

  // The save of this browser takes over, a seat without one starts fresh
  useEffect(() => {
    const save = readSave(profile)
    /* eslint-disable react-hooks/set-state-in-effect */
    setState(
      save
        ? { layout: reconcileLayout(save.layout, starting), hidden: save.hidden }
        : { layout: starting, hidden: seat.hidden }
    )
    setLoaded(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [profile, starting, seat.hidden])

  // Every change is written
  useEffect(() => {
    if (isLoaded) writeSave(profile, state)
  }, [profile, state, isLoaded])

  // Functional edits, a drag fires many in a row
  const edit = useCallback(
    (change: (layout: ModLayout) => ModLayout) =>
      setState((current) => ({ ...current, layout: change(current.layout) })),
    []
  )

  const toggleHidden = useCallback(
    (id: ModViewWindow) =>
      setState((current) => ({
        ...current,
        hidden: current.hidden.includes(id)
          ? current.hidden.filter((entry) => entry !== id)
          : [...current.hidden, id],
      })),
    []
  )

  return {
    layout: state.layout,
    hidden: state.hidden,
    isShown: (id: ModViewWindow) => !state.hidden.includes(id),
    toggleHidden,
    move: (id: ModViewWindow, spot: DropSpot) => edit((layout) => moveWindow(layout, id, spot)),
    resizeColumns: (leftId: string, rightId: string, delta: number) =>
      edit((layout) => resizeColumns(layout, leftId, rightId, delta)),
    resizeWindows: (topId: ModViewWindow, bottomId: ModViewWindow, delta: number) =>
      edit((layout) => resizeWindows(layout, topId, bottomId, delta)),
    scaleWindow: (id: ModViewWindow, factor: number) =>
      edit((layout) => scaleWindow(layout, id, factor)),
    scaleColumn: (id: ModViewWindow, factor: number) =>
      edit((layout) => scaleColumn(layout, id, factor)),
    fold: (id: ModViewWindow) => edit((layout) => toggleFold(layout, id)),
    maximize: (id: ModViewWindow) => edit((layout) => toggleMaximize(layout, id)),
    reset: () => setState({ layout: starting, hidden: seat.hidden }),
  }
}
