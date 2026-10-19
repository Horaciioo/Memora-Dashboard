'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { Drawer } from '@/components/structures/overlays/Drawer'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_TERMS, OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { ModViewState } from '@/types/modview'

export interface TermsDrawerProps {
  list: 'blocked' | 'allowed'
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
  onClose: () => void
}

/**
 * Blocked or allowed terms in a page drawer
 * @param {TermsDrawerProps} props - Drawer props
 * @return {JSX.Element}
 */

export const TermsDrawer = ({ list, state, gate, onAct, onClose }: TermsDrawerProps) => {
  const [term, setTerm] = useState('')
  const termGate = gate({ kind: 'term', list, term: '', remove: false })
  const title = list === 'blocked' ? MODVIEW_COPY.blockedTerms : MODVIEW_COPY.allowedTerms

  // The field also filters the list
  const needle = term.trim().toLowerCase()
  const terms = (list === 'blocked' ? state.blockedTerms : state.allowedTerms).filter(
    (entry) => !needle || entry.toLowerCase().includes(needle)
  )

  return (
    <Drawer open onClose={onClose} title={title} icon="blockedTerms">
      <div className={OFFENSE_SHEET.column}>
        <div className={OFFENSE_SHEET.block}>
          <span className={OFFENSE_SHEET.label}>{MODVIEW_COPY.termAdd}</span>
          <form
            className={MODVIEW_TERMS.form}
            onSubmit={(event) => {
              event.preventDefault()
              if (!needle || !termGate.allowed) return
              onAct({ kind: 'term', list, term: term.trim(), remove: false })
              setTerm('')
            }}
          >
            <Input
              value={term}
              placeholder={MODVIEW_COPY.termPlaceholder}
              aria-label={MODVIEW_COPY.termPlaceholder}
              onChange={(event) => setTerm(event.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={!needle}>
              {MODVIEW_COPY.termAdd}
            </Button>
          </form>
        </div>

        <div className={OFFENSE_SHEET.block}>
          <span className={OFFENSE_SHEET.label}>{title}</span>
          {terms.length === 0 ? (
            <p className={OFFENSE_SHEET.placeholder}>{MODVIEW_COPY.termsEmpty}</p>
          ) : (
            <ul className={MODVIEW_TERMS.list}>
              {terms.map((entry) => (
                <li key={entry}>
                  <Button
                    variant="ghost"
                    title={MODVIEW_COPY.termRemove.replace('{term}', entry)}
                    onClick={() => onAct({ kind: 'term', list, term: entry, remove: true })}
                  >
                    {entry}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  )
}
