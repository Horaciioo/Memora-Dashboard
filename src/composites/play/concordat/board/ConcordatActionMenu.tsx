'use client'

import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT_BOARD } from '@/declarations/ui/variants'

const { strikeMenu, menu } = CONCORDAT_ART

export interface ConcordatActionMenuProps {
  title: string
  caption: string
  items: { key: string; label: string; isMain?: boolean; isOff?: boolean; onPick: () => void }[]
  x: number
  y: number
  width: number
  height: number
}

/**
 * Floating box of free choices at the click, for a building or a strike
 * @param {ConcordatActionMenuProps} props - Choices and place
 * @return {JSX.Element}
 */

export const ConcordatActionMenu = ({
  title,
  caption,
  items,
  x,
  y,
  width,
  height,
}: ConcordatActionMenuProps) => (
  <div
    role="menu"
    data-hud="concordat"
    className={CONCORDAT_BOARD.menu}
    style={{
      left: Math.max(menu.gap, Math.min(width - strikeMenu.width - menu.gap, x + menu.gap)),
      top: Math.max(menu.gap, Math.min(height - strikeMenu.height - menu.gap, y + menu.gap)),
    }}
  >
    <div className={CONCORDAT_BOARD.menuHead}>
      <span className={CONCORDAT_BOARD.menuName}>{title}</span>
      <span className={CONCORDAT_BOARD.menuTie}>{caption}</span>
    </div>
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        role="menuitem"
        disabled={item.isOff}
        className={item.isMain ? CONCORDAT_BOARD.menuMain : CONCORDAT_BOARD.menuItem}
        onClick={item.onPick}
      >
        {item.label}
      </button>
    ))}
  </div>
)
