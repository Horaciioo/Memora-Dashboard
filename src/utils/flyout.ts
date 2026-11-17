// Width of a side menu in pixels
export const FLYOUT_WIDTH = 256

// Space left around it
const GAP = 8

// Room kept under the menu
const FLYOUT_TOP_ROOM = 200

/**
 * Where a side menu lands: right of its row, left if the right is short, else under the row
 * @param {DOMRect} row - Row it hangs from
 * @param {number} viewportWidth - Window width
 * @param {number} viewportHeight - Window height
 * @return {{ left: number, top: number }} - Fixed position
 */

export const flyoutPosition = (row: DOMRect, viewportWidth: number, viewportHeight: number) => {
  const top = Math.max(GAP, Math.min(row.top, viewportHeight - FLYOUT_TOP_ROOM))

  if (row.right + GAP + FLYOUT_WIDTH <= viewportWidth - GAP) {
    return { left: row.right + GAP, top }
  }

  if (row.left - GAP - FLYOUT_WIDTH >= GAP) {
    return { left: row.left - GAP - FLYOUT_WIDTH, top }
  }

  const left = Math.max(GAP, Math.min(row.left, viewportWidth - FLYOUT_WIDTH - GAP))

  return { left, top: Math.min(row.bottom + GAP / 2, viewportHeight - FLYOUT_TOP_ROOM) }
}
