import type { InputHTMLAttributes } from 'react'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

/**
 * Single line control styled on the shared field tokens
 * @param {boolean} [invalid] - Paints the rejection border
 * @return {JSX.Element}
 */

export const Input = ({ invalid, className, ...props }: InputProps) => (
  <input
    aria-invalid={invalid || undefined}
    className={cn(FIELD_STYLES.control, invalid && FIELD_STYLES.invalid, className)}
    {...props}
  />
)
