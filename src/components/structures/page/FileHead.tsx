'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useCrumbLead } from '@/core/store/crumbLead'
import { FILE_HEAD } from '@/declarations/ui/variants'

export interface FileHeadProps {
  // Glyph or portrait standing before the title
  lead?: ReactNode
  title: ReactNode
  // Status and dates under the title
  meta?: ReactNode
  actions?: ReactNode
}

/**
 * Head of a session file: its glyph, its name, where it stands and what can be done, the glyph and the name move into the top bar on a phone
 * @param {ReactNode} [lead] - Glyph or portrait
 * @param {ReactNode} title - Session name
 * @param {ReactNode} [meta] - Line under the title
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const FileHead = ({ lead, title, meta, actions }: FileHeadProps) => {
  const setCrumbLead = useCrumbLead((state) => state.set)

  // The phone trail wears the portrait, the title above is left to desktop
  useEffect(() => {
    setCrumbLead(lead)

    return () => setCrumbLead(null)
  }, [lead, setCrumbLead])

  return (
    <header className={FILE_HEAD.root}>
      <div className={FILE_HEAD.lead}>
        <span className={FILE_HEAD.leadDesktop}>{lead}</span>
        <div className={FILE_HEAD.body}>
          <h1 className={FILE_HEAD.title}>{title}</h1>
          {meta && <div className={FILE_HEAD.meta}>{meta}</div>}
        </div>
      </div>
      {actions && <div className={FILE_HEAD.actions}>{actions}</div>}
    </header>
  )
}
