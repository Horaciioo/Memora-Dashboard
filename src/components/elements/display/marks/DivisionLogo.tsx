import { DivisionCrest } from '@/components/elements/display/glyphs/BrandGlyphs'
import { divisionTier } from '@/declarations/members/divisions'
import { cn } from '@/utils/classnames'

export interface DivisionLogoProps {
  label: string
  className?: string
}

/**
 * Escutcheon of a division
 * @param {string} label - Division name
 * @param {string} [className] - Sizing classes
 * @return {JSX.Element | null}
 */

export const DivisionLogo = ({ label, className }: DivisionLogoProps) => {
  const tier = divisionTier(label)
  if (tier === null) return null

  return (
    <span title={label} className={cn('inline-flex shrink-0', className)}>
      <DivisionCrest tier={tier} className="h-full w-full" />
    </span>
  )
}
