'use client'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { AddRow } from '@/components/structures/inline/AddRow'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { UnbanPage } from '@/declarations/unban/form'
import type { ReactNode } from 'react'

export interface PageSectionProps {
  page: UnbanPage
  // Position among the pages, from 1
  number: number
  // Pages are named only when there are several
  isNamed: boolean
  isEmpty: boolean
  canAdd: boolean
  onRename: (title: string) => void
  onRemove: () => void
  onAdd: () => void
  children: ReactNode
}

/**
 * One page of the questionnaire, its title, its questions and the way to add one
 * @param {PageSectionProps} props - Component props
 * @return {JSX.Element}
 */

export const PageSection = ({
  page,
  number,
  isNamed,
  isEmpty,
  canAdd,
  onRename,
  onRemove,
  onAdd,
  children,
}: PageSectionProps) => (
  <div className={UNBAN_DESK_STYLES.page}>
    {isNamed && (
      <div className={UNBAN_DESK_STYLES.pageHead}>
        <span className={UNBAN_DESK_STYLES.sectionTitle}>
          {UNBAN_SCREEN_COPY.formPageName.replace('{n}', String(number))}
        </span>
        <Input
          aria-label={UNBAN_SCREEN_COPY.formPageTitle}
          placeholder={UNBAN_SCREEN_COPY.formPageTitle}
          value={page.title ?? ''}
          onChange={(event) => onRename(event.target.value)}
        />
        <Button
          variant="icon"
          icon="remove"
          aria-label={UNBAN_SCREEN_COPY.formRemovePage}
          onClick={onRemove}
        />
      </div>
    )}
    {children}
    {isEmpty && isNamed && (
      <p className={UNBAN_DESK_STYLES.barNote}>{UNBAN_SCREEN_COPY.formPageEmpty}</p>
    )}
    <AddRow label={UNBAN_SCREEN_COPY.formAdd} disabled={!canAdd} onClick={onAdd} />
  </div>
)
