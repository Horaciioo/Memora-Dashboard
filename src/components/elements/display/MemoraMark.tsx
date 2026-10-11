import Image from 'next/image'

import mark from '@/app/icon.png'
import { APP_NAME } from '@/declarations/app'
import { cn } from '@/utils/classnames'

export interface MemoraMarkProps {
  className?: string
}

/**
 * Memora's pink logo, round
 * @param {string} [className] - Size and extra classes
 * @return {JSX.Element}
 */

export const MemoraMark = ({ className }: MemoraMarkProps) => (
  <Image src={mark} alt={APP_NAME} className={cn('rounded-full', className)} />
)
