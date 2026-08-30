import type { ReactNode } from 'react'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import type { MaturityName } from '@/declarations/maturity/registries'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  maturity?: MaturityName
  className?: string
  children: ReactNode
}

/**
 * Label, control and message wrapper shared by every input
 * @param {string} id - Identifier of the wrapped control
 * @param {string} label - Field label
 * @param {string} [hint] - Helper line below the control
 * @param {string} [error] - Rejection message replacing the hint
 * @param {boolean} [required] - Marks the field as mandatory
 * @param {MaturityName} [maturity] - Lifecycle tag drawn beside the label
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @param {ReactNode} children - The control itself
 * @return {JSX.Element}
 */

export const Field = ({
  id,
  label,
  hint,
  error,
  required,
  maturity,
  className,
  children,
}: FieldProps) => {
  const AlertIcon = ICONS.danger

  return (
    <div className={cn(FIELD_STYLES.wrapper, className)}>
      <span className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className={FIELD_STYLES.label}>
          {label}
          {required && <span className={FIELD_STYLES.required}> *</span>}
        </label>
        {maturity && <MaturityTag maturity={maturity} />}
      </span>
      {children}
      {error ? (
        <p id={`${id}-error`} className={FIELD_STYLES.error}>
          <AlertIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={FIELD_STYLES.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
