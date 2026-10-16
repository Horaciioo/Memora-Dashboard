'use client'

import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { cn } from '@/utils/classnames'

export interface RecordIdProps {
  id: string
  className?: string
}

/**
 * Record identifier in mono, a click copies it
 * @param {RecordIdProps} props - Identifier, a "source:" prefix is dropped
 * @return {JSX.Element}
 */

export const RecordId = ({ id, className }: RecordIdProps) => {
  const copy = useCopy(FIELD_COPY.idCopied)
  const value = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id

  return (
    <button
      type="button"
      title={FIELD_COPY.id}
      onClick={() => void copy(value)}
      className={cn('cursor-pointer font-mono text-xs break-all', className)}
    >
      {value}
    </button>
  )
}
