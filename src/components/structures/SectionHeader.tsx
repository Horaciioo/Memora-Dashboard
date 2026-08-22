import type { ReactNode } from 'react'

export interface SectionHeaderProps {
  title: string
  action?: ReactNode
}

/**
 * Section title with an optional right-aligned action
 * @param {string} title - Section title
 * @param {ReactNode} [action] - Control rendered on the right, e.g. a button
 * @return {JSX.Element}
 */

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <h2 className="font-medium">{title}</h2>
    {action}
  </div>
)
