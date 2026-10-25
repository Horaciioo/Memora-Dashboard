'use client'

import { Drawer } from '@/components/structures/overlays/Drawer'
import { BAC_RULES } from '@/declarations/ui/variants'

export interface PlayRulesDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  rows: { label: string; value: string }[]
}

/**
 * Rules chosen for a game, read only
 * @param {PlayRulesDrawerProps} props - Drawer state and rows
 * @return {JSX.Element}
 */

export const PlayRulesDrawer = ({ open, onClose, title, rows }: PlayRulesDrawerProps) => (
  <Drawer open={open} onClose={onClose} title={title} icon="playRules">
    <dl className={BAC_RULES.list}>
      {rows.map((row) => (
        <div key={row.label} className={BAC_RULES.row}>
          <dt className={BAC_RULES.label}>{row.label}</dt>
          <dd className={BAC_RULES.value}>{row.value}</dd>
        </div>
      ))}
    </dl>
  </Drawer>
)
