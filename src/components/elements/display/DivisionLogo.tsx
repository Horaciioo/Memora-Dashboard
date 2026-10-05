import Image from 'next/image'

import { divisionLogo } from '@/declarations/members/profiles'
import { cn } from '@/utils/classnames'

export interface DivisionLogoProps {
  label: string
  // Path kept in the database
  src?: string | null
  className?: string
}

/**
 * Official logo of a division
 * @param {string} label - Division name
 * @param {string | null} [src] - Stored path
 * @param {string} [className] - Sizing classes
 * @return {JSX.Element | null}
 */

export const DivisionLogo = ({ label, src, className }: DivisionLogoProps) => {
  const path = divisionLogo(label, src)
  if (!path) return null

  return (
    <Image
      src={path}
      alt={label}
      title={label}
      width={128}
      height={128}
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
