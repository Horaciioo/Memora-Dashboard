'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { ROUTES } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'

export interface BackButtonProps {
  label: string
  icon?: IconName
}

/**
 * Sends the viewer back where they came from, or home on a direct visit
 * @param {string} label - Button label
 * @param {IconName} [icon] - Leading glyph
 * @return {JSX.Element}
 */

export const BackButton = ({ label, icon = 'confirm' }: BackButtonProps) => {
  const router = useRouter()

  return (
    <Button
      variant="primary"
      icon={icon}
      onClick={() => (window.history.length > 1 ? router.back() : router.push(ROUTES.dashboard))}
    >
      {label}
    </Button>
  )
}
