'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { ROUTES } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'

export interface BackButtonProps {
  label: string
  icon?: IconName
  className?: string
}

/**
 * Sends the viewer back where they came from
 * @param {string} label - Button label
 * @param {IconName} [icon] - Leading glyph
 * @param {string} [className] - Extra classes merged onto the button
 * @return {JSX.Element}
 */

export const BackButton = ({ label, icon = 'confirm', className }: BackButtonProps) => {
  const router = useRouter()

  return (
    <Button
      variant="primary"
      icon={icon}
      className={className}
      onClick={() => (window.history.length > 1 ? router.back() : router.push(ROUTES.dashboard))}
    >
      {label}
    </Button>
  )
}
