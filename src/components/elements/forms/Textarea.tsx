import type { TextareaHTMLAttributes } from 'react'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/**
 * Multi line control styled on the shared field tokens
 * @param {boolean} [invalid] - Paints the rejection border
 * @return {JSX.Element}
 */

export const Textarea = ({ invalid, className, ...props }: TextareaProps) => (
  <textarea
    aria-invalid={invalid || undefined}
    className={cn(FIELD_STYLES.control, FIELD_STYLES.textarea, invalid && FIELD_STYLES.invalid, className)}
    {...props}
  />
)
