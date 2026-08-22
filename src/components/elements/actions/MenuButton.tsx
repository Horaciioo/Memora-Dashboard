'use client'

import { Button } from '@/components/elements/actions/Button'
import { useMenu, type MenuItem } from '@/managers/front-end/MenuManager'

export interface MenuButtonProps {
  items: MenuItem[]
  label: string
  title?: string
}

/**
 * Trigger opening the shared menu layer right under itself
 * @param {MenuItem[]} items - Entries of the menu
 * @param {string} label - Accessible name of the trigger
 * @param {string} [title] - Section label above the entries
 * @return {JSX.Element}
 */

export const MenuButton = ({ items, label, title }: MenuButtonProps) => {
  const { openMenu } = useMenu()

  return (
    <Button
      variant="icon"
      icon="expand"
      aria-label={label}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        openMenu(items, { x: rect.left, y: rect.bottom + 4 }, title)
      }}
    />
  )
}
