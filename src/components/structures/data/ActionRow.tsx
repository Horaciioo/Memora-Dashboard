import type { ReactNode } from 'react'
import { ACTION_ROW } from '@/declarations/ui/variants'

export interface ActionRowProps {
  title: string
  description: string
  // The control standing at the end of the row
  children: ReactNode
}

/**
 * Setting line: words on the left, its action at the end
 * @param {ActionRowProps} props - Words and action
 * @return {JSX.Element}
 */

export const ActionRow = ({ title, description, children }: ActionRowProps) => (
  <div className={ACTION_ROW.row}>
    <div className={ACTION_ROW.body}>
      <p className={ACTION_ROW.title}>{title}</p>
      <p className={ACTION_ROW.lead}>{description}</p>
    </div>
    <div className={ACTION_ROW.action}>{children}</div>
  </div>
)
