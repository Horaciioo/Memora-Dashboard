import type { SelectHTMLAttributes } from 'react'
import { SELECT_STYLES, type SelectSize } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  // Named apart from the native numeric `size` attribute
  textSize?: SelectSize
}

/**
 * Styled native select, keeps native keyboard behaviour
 * @param {SelectSize} [textSize] - Text size, defaults to sm
 * @return {JSX.Element}
 */

export const Select = ({ textSize = 'sm', className, ...props }: SelectProps) => (
  <select className={cn(SELECT_STYLES.base, SELECT_STYLES[textSize], className)} {...props} />
)
