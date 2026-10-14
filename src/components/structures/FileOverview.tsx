import type { ReactNode } from 'react'

import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { InlineMarkdown } from '@/components/structures/InlineMarkdown'
import { FILE_BOX } from '@/declarations/ui/variants'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { FieldIssue, FieldValue, FormValues } from '@/types/forms'

/**
 * One box of an overview
 * @typedef {Object} FileOverviewGroup
 * @property {string} id - Box identifier
 * @property {string} title - Heading over the box
 * @property {EditableEntry[]} [entries] - Properties edited in place
 * @property {ReactNode} [node] - Free content under the properties
 * @property {ReactNode} [side] - Frameless panel beside the box, as tall as it
 */

export interface FileOverviewGroup {
  id: string
  title: string
  entries?: EditableEntry[]
  node?: ReactNode
  side?: ReactNode
}

export interface FileOverviewProps {
  entries?: EditableEntry[]
  // One box per group, the single informations box when absent
  groups?: FileOverviewGroup[]
  values: FormValues
  issues: FieldIssue[]
  disabled?: boolean
  onCommit: (name: string, value: FieldValue) => Promise<boolean>
  // Written in place under the grid
  description?: {
    id: string
    // Heading over the text, the generic one when absent
    label?: string
    value: string
    maxLength?: number
    onCommit: (value: string) => Promise<boolean>
  }
  // Sections laid after the box, as wide as the box when a panel sits beside it
  children?: ReactNode
}

/**
 * Overview of a session file: its properties edited in place, then the people around it
 * @param {EditableEntry[]} [entries] - Properties in display order
 * @param {FileOverviewGroup[]} [groups] - Boxes replacing the single one
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {boolean} [disabled] - Blocks editing
 * @param {(name: string, value: FieldValue) => Promise<boolean>} onCommit - Persists one field
 * @param {Object} [description] - Markdown description
 * @param {ReactNode} [children] - Sections laid after the box
 * @return {JSX.Element}
 */

export const FileOverview = ({
  entries,
  groups,
  values,
  issues,
  disabled,
  onCommit,
  description,
  children,
}: FileOverviewProps) => {
  const boxes = groups ?? [
    { id: 'main', title: SESSION_FILE_COPY.informations, entries: entries ?? [] },
  ]

  return (
    <div className={FILE_BOX.stack}>
      {boxes.map((box, index) => (
        <section key={box.id} className={box.side ? FILE_BOX.row : SECTION_STYLES.wrapper}>
          <h2 className={cn(SECTION_STYLES.title, FILE_BOX.rowTitle)}>{box.title}</h2>
          <div className={cn(FILE_BOX.box, FILE_BOX.rowBox)}>
            <div className={FILE_BOX.main}>
              {box.entries && box.entries.length > 0 && (
                <EditableDetailGrid
                  entries={box.entries}
                  values={values}
                  issues={issues}
                  disabled={disabled}
                  onCommit={onCommit}
                />
              )}
              {box.node}
              {description && index === 0 && (
                <>
                  <h3 className={SECTION_STYLES.wellTitle}>
                    {description.label ?? SESSION_FILE_COPY.description}
                  </h3>
                  <div className={SECTION_STYLES.well}>
                    <InlineMarkdown
                      id={description.id}
                      value={description.value}
                      placeholder={SESSION_FILE_COPY.descriptionEmpty}
                      disabled={disabled}
                      maxLength={description.maxLength}
                      onCommit={description.onCommit}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          {box.side && <div className={FILE_BOX.rowSide}>{box.side}</div>}
        </section>
      ))}
      {children &&
        (boxes.some((box) => box.side) ? (
          <div className={FILE_BOX.row}>
            <div className={FILE_BOX.rowBox}>{children}</div>
          </div>
        ) : (
          children
        ))}
    </div>
  )
}
