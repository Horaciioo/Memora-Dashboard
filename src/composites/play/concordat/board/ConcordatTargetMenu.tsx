'use client'

import { actionsFor, rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import {
  CONCORDAT_ACTION_LABELS,
  CONCORDAT_TIE_LABELS,
} from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_BOARD } from '@/declarations/ui/variants'
import type { ConcordatTargetAction, ConcordatTieKind } from '@/utils/constants/concordat'

const { menu } = CONCORDAT_ART

export interface ConcordatTargetMenuProps {
  name: string
  color: readonly number[]
  tie: ConcordatTieKind
  x: number
  y: number
  width: number
  height: number
  onPick: (action: ConcordatTargetAction) => void
}

/**
 * Gestures on a nation, floating at the click and never a modal
 * @param {ConcordatTargetMenuProps} props - Target and place
 * @return {JSX.Element}
 */

export const ConcordatTargetMenu = ({
  name,
  color,
  tie,
  x,
  y,
  width,
  height,
  onPick,
}: ConcordatTargetMenuProps) => (
  <div
    role="menu"
    data-hud="concordat"
    className={CONCORDAT_BOARD.menu}
    style={{
      left: Math.max(menu.gap, Math.min(width - menu.width - menu.gap, x + menu.gap)),
      top: Math.max(menu.gap, Math.min(height - menu.height - menu.gap, y + menu.gap)),
    }}
  >
    <div className={CONCORDAT_BOARD.menuHead}>
      <span className={CONCORDAT_BOARD.menuSwatch} style={{ background: rgbText(color) }} />
      <span className={CONCORDAT_BOARD.menuName}>{name}</span>
      <span className={CONCORDAT_BOARD.menuTie}>{CONCORDAT_TIE_LABELS[tie]}</span>
    </div>
    {actionsFor(tie).map((action, index) => (
      <button
        key={action}
        type="button"
        role="menuitem"
        className={index === 0 ? CONCORDAT_BOARD.menuMain : CONCORDAT_BOARD.menuItem}
        onClick={() => onPick(action)}
      >
        {CONCORDAT_ACTION_LABELS[action]}
      </button>
    ))}
  </div>
)
