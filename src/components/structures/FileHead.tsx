import type { ReactNode } from 'react'

import { FILE_HEAD } from '@/declarations/ui/variants'

export interface FileHeadProps {
  // Glyph or portrait standing before the title
  lead?: ReactNode
  title: string
  // Status and dates under the title
  meta?: ReactNode
  actions?: ReactNode
}

/**
 * Head of a session file: its glyph, its name, where it stands and what can be done
 * @param {ReactNode} [lead] - Glyph or portrait
 * @param {string} title - Session name
 * @param {ReactNode} [meta] - Line under the title
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const FileHead = ({ lead, title, meta, actions }: FileHeadProps) => (
  <header className={FILE_HEAD.root}>
    <div className={FILE_HEAD.lead}>
      {lead}
      <div className={FILE_HEAD.body}>
        <h1 className={FILE_HEAD.title}>{title}</h1>
        {meta && <div className={FILE_HEAD.meta}>{meta}</div>}
      </div>
    </div>
    {actions && <div className={FILE_HEAD.actions}>{actions}</div>}
  </header>
)
