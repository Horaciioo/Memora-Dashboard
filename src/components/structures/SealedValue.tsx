'use client'

import type { ReactNode } from 'react'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { SENSITIVE_FIELD_REGISTRY } from '@/declarations/access/sensitive'
import type { SensitiveFieldName } from '@/declarations/access/sensitive'
import { SEAL_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'

export interface SealedValueProps {
  field: SensitiveFieldName
}

/**
 * Red A2F mark standing in for a value
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
      <ICONS.twoFactor className={SEAL_BLOCK.icon} />
      <span className={SEAL_BLOCK.hint}>{TWO_FACTOR_COPY.sealedHint}</span>
    </button>
  )
}

/**
 * Pick A2F mark or content
 * @param {SensitiveFieldName} field - Value key
 * @param {ReactNode} value - Content
 * @param {boolean} isUnsealed - Window still open
 * @return {ReactNode} - A2F mark or content
 */

export const sealedDisplay = (
  field: SensitiveFieldName,
  value: ReactNode,
  isUnsealed: boolean
): ReactNode => (isUnsealed ? value : <SealedValue field={field} />)
