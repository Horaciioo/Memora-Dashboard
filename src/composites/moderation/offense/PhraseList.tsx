'use client'

import { Button } from '@/components/elements/actions/Button'
import { TermInput } from '@/composites/moderation/offense/TermInput'
import { PHRASE_SEPARATOR, addTerms } from '@/core/lib/modview/terms'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { DETECTION_PANEL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PhraseListProps {
  phrases: string[]
  // Edge colour of each line
  edge: string
  placeholder: string
  blank: string
  canManage: boolean
  onChange: (phrases: string[]) => void
}

/**
 * Chat lines to moderate or to leave
 * @param {PhraseListProps} props - Lines and handler
 * @return {JSX.Element}
 */

export const PhraseList = ({
  phrases,
  edge,
  placeholder,
  blank,
  canManage,
  onChange,
}: PhraseListProps) => (
  <div className="flex flex-col gap-3">
    {phrases.length === 0 ? (
      <p className="text-sm text-[var(--color-ink-subtle)] italic">{blank}</p>
    ) : (
      <ul className={DETECTION_PANEL.lines}>
        {phrases.map((phrase) => (
          <li key={phrase} className={cn(DETECTION_PANEL.line, edge)}>
            <span className={DETECTION_PANEL.lineText}>{phrase}</span>
            {canManage && (
              <Button
                variant="icon"
                icon="remove"
                aria-label={SANCTION_COPY.remove}
                onClick={() => onChange(phrases.filter((other) => other !== phrase))}
              />
            )}
          </li>
        ))}
      </ul>
    )}
    {canManage && (
      <TermInput
        placeholder={placeholder}
        maxLength={FORM_SETTINGS.titleMaxLength}
        onAdd={(raw) =>
          onChange(addTerms(phrases, raw, PHRASE_SEPARATOR, FORM_SETTINGS.longTextMaxLength))
        }
      />
    )}
  </div>
)
