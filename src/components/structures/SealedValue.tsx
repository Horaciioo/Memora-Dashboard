'use client'

import type { ReactNode } from 'react'
import { SealGlyph } from '@/components/elements/display/SealGlyph'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { SENSITIVE_FIELD_REGISTRY } from '@/declarations/access/sensitive'
import type { SensitiveFieldName } from '@/declarations/access/sensitive'
import { SEAL_BLOCK } from '@/declarations/ui/blocks'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'

export interface SealedValueProps {
  field: SensitiveFieldName
}

/**
 * Padlock standing in for a value
 * @param {SensitiveFieldName} field - Value key
 * @return {JSX.Element}
 */

export const SealedValue = ({ field }: SealedValueProps) => {
  const { promptUnlock } = useSeal()
  const label = SENSITIVE_FIELD_REGISTRY.label(field)

  return (
    <button
      type="button"
      onClick={promptUnlock}
      aria-label={`${TWO_FACTOR_COPY.reveal} — ${label}`}
      title={TWO_FACTOR_COPY.sealedHint}
      className={SEAL_BLOCK.trigger}
    >
      <SealGlyph />
      <span className={SEAL_BLOCK.hint}>{TWO_FACTOR_COPY.sealedHint}</span>
    </button>
  )
}

/**
 * Pick padlock or content
 * @param {SensitiveFieldName} field - Value key
 * @param {ReactNode} value - Content, shown once the window is open
 * @param {boolean} isUnsealed - Window still open
 * @return {ReactNode} - Padlock or content
 */

export const sealedDisplay = (
  field: SensitiveFieldName,
  value: ReactNode,
  isUnsealed: boolean
): ReactNode => (isUnsealed ? value : <SealedValue field={field} />)
