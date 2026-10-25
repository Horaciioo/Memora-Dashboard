import type { ModViewWindow } from '@/types/modview'

/**
 * One window of the workspace
 * @typedef {Object} LayoutWindow
 * @property {ModViewWindow} id - Window
 * @property {number} weight - Share of the column height
 * @property {boolean} isFolded - Reduced to its heading
 * @property {boolean} [isBeside] - Shares the row of the window above
 */

export interface LayoutWindow {
  id: ModViewWindow
  weight: number
  isFolded: boolean
  isBeside?: boolean
}

/**
 * Starting column: a window, or windows side by side
 * @typedef {(ModViewWindow | ModViewWindow[])[]} ColumnSpec
 */

export type ColumnSpec = (ModViewWindow | ModViewWindow[])[]

/**
 * One column of the workspace
 * @typedef {Object} LayoutColumn
 * @property {string} id - Column
 * @property {number} weight - Share of the width
 * @property {LayoutWindow[]} windows - Windows, top to bottom
 */

export interface LayoutColumn {
  id: string
  weight: number
  windows: LayoutWindow[]
}

/**
 * Arrangement of the windows
 * @typedef {Object} ModLayout
 * @property {LayoutColumn[]} columns - Columns, left to right
 * @property {ModViewWindow | null} maximized - Window filling the workspace
 */

export interface ModLayout {
  columns: LayoutColumn[]
  maximized: ModViewWindow | null
}

/**
 * Where a window lands
 * @typedef {{ column: string, index: number } | { newColumnAt: number }} DropSpot
 */

export type DropSpot = { column: string; index: number } | { newColumnAt: number }

// Smallest share a window or column keeps
export const MIN_WEIGHT = 0.25

// Step of the grow and shrink gestures
export const SCALE_STEP = 1.25

/**
 * Starting layout of a seat
 * @param {ColumnSpec[]} columns - Windows per column
 * @param {number[]} widths - Column widths
 * @param {Partial<Record<ModViewWindow, number>>} [sizes] - Height share of some windows
 * @return {ModLayout} - Layout
 */

export const buildLayout = (
  columns: ColumnSpec[],
  widths: number[],
  sizes: Partial<Record<ModViewWindow, number>> = {}
): ModLayout => ({
  maximized: null,
  columns: columns.map((windows, index) => ({
    id: `column-${index}`,
    weight: widths[index] ?? 1,
    windows: windows.flatMap((entry) =>
      [entry].flat().map((id, position) => ({
        id,
        weight: sizes[id] ?? 1,
        isFolded: false,
        isBeside: position > 0,
      }))
    ),
  })),
})

/**
 * Windows sharing one row, side by side
 * @param {LayoutWindow[]} windows - Column windows
 * @return {LayoutWindow[][]} - Rows, top to bottom
 */

export const rowsOf = (windows: LayoutWindow[]): LayoutWindow[][] =>
  windows.reduce<LayoutWindow[][]>((rows, entry) => {
    if (entry.isBeside && rows.length > 0) rows.at(-1)!.push(entry)
    else rows.push([entry])

    return rows
  }, [])

/**
 * Keep the allowed windows of a starting layout
 * @param {ColumnSpec[]} columns - Starting columns
 * @param {ModViewWindow[]} allowed - Windows kept
 * @return {ColumnSpec[]} - Columns
 */

export const allowSpec = (columns: ColumnSpec[], allowed: ModViewWindow[]): ColumnSpec[] =>
  columns.map((column) =>
    column.flatMap((entry): ColumnSpec => {
      const kept = [entry].flat().filter((id) => allowed.includes(id))
      if (kept.length === 0) return []

      return [kept.length === 1 ? kept[0]! : kept]
    })
  )

/**
 * Keep some windows, the next of a lost row head takes its place
 * @param {LayoutWindow[]} windows - Column windows
 * @param {(id: ModViewWindow) => boolean} keep - Windows kept
 * @return {LayoutWindow[]} - Windows kept
 */

export const keepWindows = (
  windows: LayoutWindow[],
  keep: (id: ModViewWindow) => boolean
): LayoutWindow[] => {
  let isRowAlive = false

  return windows.flatMap((entry) => {
    if (!entry.isBeside) isRowAlive = false
    if (!keep(entry.id)) return []

    const startsRow = !isRowAlive
    isRowAlive = true

    return [{ ...entry, isBeside: !startsRow }]
  })
}

/**
 * Drop empty columns
 * @param {ModLayout} layout - Layout
 * @return {ModLayout} - Layout without empty columns
 */

const prune = (layout: ModLayout): ModLayout => ({
  ...layout,
  columns: layout.columns.filter((column) => column.windows.length > 0),
})

/**
 * Every window of the layout
 * @param {ModLayout} layout - Layout
 * @return {ModViewWindow[]} - Windows
 */

export const windowsOfLayout = (layout: ModLayout): ModViewWindow[] =>
  layout.columns.flatMap((column) => column.windows.map((entry) => entry.id))

// Share that can size a flex track
const isWeight = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

/**
 * Whether a value read back from storage is a usable layout
 * @param {unknown} value - Stored value
 * @return {boolean} - Usable layout
 */

export const isLayout = (value: unknown): value is ModLayout => {
  if (!value || typeof value !== 'object') return false
  const { columns, maximized } = value as Partial<ModLayout>

  return (
    (maximized === null || typeof maximized === 'string') &&
    Array.isArray(columns) &&
    columns.every(
      (column) =>
        typeof column?.id === 'string' &&
        isWeight(column.weight) &&
        Array.isArray(column.windows) &&
        column.windows.every(
          (entry) =>
            typeof entry?.id === 'string' &&
            isWeight(entry.weight) &&
            typeof entry.isFolded === 'boolean'
        )
    )
  )
}

/**
 * Line a saved layout up with the windows a seat may open
 * @param {ModLayout | null} saved - Saved layout
 * @param {ModLayout} fallback - Starting layout
 * @return {ModLayout} - Layout holding exactly the allowed windows
 */

export const reconcileLayout = (saved: ModLayout | null, fallback: ModLayout): ModLayout => {
  if (!saved) return fallback

  const allowed = new Set(windowsOfLayout(fallback))
  const kept = prune({
    maximized: saved.maximized && allowed.has(saved.maximized) ? saved.maximized : null,
    columns: saved.columns.map((column) => ({
      ...column,
      windows: keepWindows(column.windows, (id) => allowed.has(id)),
    })),
  })

  // Windows the save never knew land where the fallback puts them
  const known = new Set(windowsOfLayout(kept))
  const missing = fallback.columns.flatMap((column) =>
    column.windows.filter((entry) => !known.has(entry.id))
  )
  if (kept.columns.length === 0) return fallback
  if (missing.length > 0) kept.columns.at(-1)!.windows.push(...missing)

  return kept
}

/**
 * Keep only the windows on show
 * @param {ModLayout} layout - Layout
 * @param {(id: ModViewWindow) => boolean} isShown - Window on show
 * @return {LayoutColumn[]} - Columns without hidden windows
 */

export const shownColumns = (
  layout: ModLayout,
  isShown: (id: ModViewWindow) => boolean
): LayoutColumn[] =>
  layout.columns
    .map((column) => ({ ...column, windows: keepWindows(column.windows, isShown) }))
    .filter((column) => column.windows.length > 0)

/**
 * Take a window out of its column
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} id - Window
 * @return {{ layout: ModLayout, taken: LayoutWindow | null }} - Layout and the window
 */

const take = (layout: ModLayout, id: ModViewWindow) => {
  const taken = layout.columns.flatMap((column) => column.windows).find((entry) => entry.id === id)
  const columns = layout.columns.map((column) => ({
    ...column,
    windows: keepWindows(column.windows, (kept) => kept !== id),
  }))

  return { layout: { ...layout, columns }, taken: taken ? { ...taken, isBeside: false } : null }
}

/**
 * Move a window to a drop spot
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} id - Window
 * @param {DropSpot} spot - Where it lands
 * @return {ModLayout} - New layout
 */

export const moveWindow = (layout: ModLayout, id: ModViewWindow, spot: DropSpot): ModLayout => {
  const { layout: without, taken } = take(layout, id)
  if (!taken) return layout

  if ('newColumnAt' in spot) {
    const column: LayoutColumn = { id: `column-${Date.now()}`, weight: 1, windows: [taken] }
    const columns = [...without.columns]
    columns.splice(Math.min(spot.newColumnAt, columns.length), 0, column)

    return prune({ ...without, columns })
  }

  const columns = without.columns.map((column) => {
    if (column.id !== spot.column) return column
    const windows = [...column.windows]
    windows.splice(Math.min(spot.index, windows.length), 0, taken)

    return { ...column, windows }
  })

  return prune({ ...without, columns })
}

/**
 * Shift width between two neighbouring columns
 * @param {ModLayout} layout - Layout
 * @param {string} leftId - Column on the left of the handle
 * @param {string} rightId - Column on its right
 * @param {number} delta - Weight moved to the left column, negative moves it right
 * @return {ModLayout} - New layout
 */

export const resizeColumns = (
  layout: ModLayout,
  leftId: string,
  rightId: string,
  delta: number
): ModLayout => {
  const left = layout.columns.find((column) => column.id === leftId)
  const right = layout.columns.find((column) => column.id === rightId)
  if (!left || !right) return layout

  // Neither side drops under the minimum
  const shift = Math.min(Math.max(delta, MIN_WEIGHT - left.weight), right.weight - MIN_WEIGHT)
  const columns = layout.columns.map((column) =>
    column.id === left.id
      ? { ...column, weight: column.weight + shift }
      : column.id === right.id
        ? { ...column, weight: column.weight - shift }
        : column
  )

  return { ...layout, columns }
}

/**
 * Shift height between two neighbouring windows
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} topId - Window above the handle
 * @param {ModViewWindow} bottomId - Window below the handle
 * @param {number} delta - Weight moved to the top window
 * @return {ModLayout} - New layout
 */

export const resizeWindows = (
  layout: ModLayout,
  topId: ModViewWindow,
  bottomId: ModViewWindow,
  delta: number
): ModLayout => {
  const find = (id: ModViewWindow) =>
    layout.columns.flatMap((column) => column.windows).find((entry) => entry.id === id)
  const top = find(topId)
  const bottom = find(bottomId)
  if (!top || !bottom) return layout

  const shift = Math.min(Math.max(delta, MIN_WEIGHT - top.weight), bottom.weight - MIN_WEIGHT)

  return {
    ...layout,
    columns: layout.columns.map((column) => ({
      ...column,
      windows: column.windows.map((entry) =>
        entry.id === topId
          ? { ...entry, weight: entry.weight + shift }
          : entry.id === bottomId
            ? { ...entry, weight: entry.weight - shift }
            : entry
      ),
    })),
  }
}

/**
 * Make a window taller or shorter
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} id - Window
 * @param {number} factor - Multiplier of its weight
 * @return {ModLayout} - New layout
 */

export const scaleWindow = (layout: ModLayout, id: ModViewWindow, factor: number): ModLayout => ({
  ...layout,
  columns: layout.columns.map((column) => ({
    ...column,
    windows: column.windows.map((entry) =>
      entry.id === id ? { ...entry, weight: Math.max(MIN_WEIGHT, entry.weight * factor) } : entry
    ),
  })),
})

/**
 * Make the column of a window wider or narrower
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} id - Window
 * @param {number} factor - Multiplier of the column weight
 * @return {ModLayout} - New layout
 */

export const scaleColumn = (layout: ModLayout, id: ModViewWindow, factor: number): ModLayout => ({
  ...layout,
  columns: layout.columns.map((column) =>
    column.windows.some((entry) => entry.id === id)
      ? { ...column, weight: Math.max(MIN_WEIGHT, column.weight * factor) }
      : column
  ),
})

/**
 * Fold or unfold a window
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} id - Window
 * @return {ModLayout} - New layout
 */

export const toggleFold = (layout: ModLayout, id: ModViewWindow): ModLayout => ({
  ...layout,
  columns: layout.columns.map((column) => ({
    ...column,
    windows: column.windows.map((entry) =>
      entry.id === id ? { ...entry, isFolded: !entry.isFolded } : entry
    ),
  })),
})

/**
 * Fill the workspace with a window, or give the room back
 * @param {ModLayout} layout - Layout
 * @param {ModViewWindow} id - Window
 * @return {ModLayout} - New layout
 */

export const toggleMaximize = (layout: ModLayout, id: ModViewWindow): ModLayout => ({
  ...layout,
  maximized: layout.maximized === id ? null : id,
})
