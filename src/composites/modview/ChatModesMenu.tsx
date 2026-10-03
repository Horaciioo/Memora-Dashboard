'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { CHAT_MODES, MODVIEW_DEFAULTS } from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_MODES } from '@/declarations/ui/variants'
import type { ChatModeName, ModViewState } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface ChatModesMenuProps {
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Whether one mode is on
 * @param {ModViewState['modes']} modes - Modes in force
 * @param {ChatModeName} mode - Mode
 * @return {boolean} - On
 */

const isOn = (modes: ModViewState['modes'], mode: ChatModeName): boolean =>
  mode === 'slow' ? modes.slowSeconds !== null : modes[mode]

/**
 * Chat modes and terms, each greyed for whoever may not touch it
 * @param {ModViewState} state - Mod View state
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @return {JSX.Element}
 */

export const ChatModesMenu = ({ state, gate, onAct }: ChatModesMenuProps) => {
  const [list, setList] = useState<'blocked' | 'allowed' | null>(null)
  const [term, setTerm] = useState('')
  const termGate = gate({ kind: 'term', list: 'blocked', term: '', remove: false })

  const terms = list === 'blocked' ? state.blockedTerms : state.allowedTerms

  return (
    <div className={MODVIEW_MODES.panel} role="menu" aria-label={MODVIEW_COPY.modes}>
      {CHAT_MODES.keys.map((mode) => {
        const option = CHAT_MODES.get(mode)
        const Icon = ICONS[option.icon]
        const on = isOn(state.modes, mode)
        const check = gate({ kind: 'mode', mode, enabled: !on })

        return (
          <button
            key={mode}
            type="button"
            role="menuitemcheckbox"
            aria-checked={on}
            disabled={!check.allowed}
            title={check.reason ?? undefined}
            className={MODVIEW_MODES.row}
            onClick={() =>
              onAct({ kind: 'mode', mode, enabled: !on, seconds: MODVIEW_DEFAULTS.slowMode })
            }
          >
            <Icon className={MODVIEW_MODES.rowIcon} aria-hidden="true" />
            <span className={MODVIEW_MODES.rowLabel}>{option.label}</span>
            <span className={cn(MODVIEW_MODES.rowState, on ? MODVIEW_MODES.on : MODVIEW_MODES.off)}>
              {on ? MODVIEW_COPY.modeOn : MODVIEW_COPY.modeOff}
            </span>
          </button>
        )
      })}

      {(['blocked', 'allowed'] as const).map((key) => (
        <button
          key={key}
          type="button"
          className={MODVIEW_MODES.row}
          aria-expanded={list === key}
          onClick={() => setList(list === key ? null : key)}
        >
          <ICONS.blockedTerms className={MODVIEW_MODES.rowIcon} aria-hidden="true" />
          <span className={MODVIEW_MODES.rowLabel}>
            {key === 'blocked' ? MODVIEW_COPY.blockedTerms : MODVIEW_COPY.allowedTerms}
          </span>
        </button>
      ))}

      {list && (
        <div className={MODVIEW_MODES.terms}>
          {terms.length === 0 ? (
            <p className={MODVIEW_MODES.reason}>{MODVIEW_COPY.termsEmpty}</p>
          ) : (
            <ul className={MODVIEW_MODES.termList}>
              {terms.map((entry) => (
                <li key={entry}>
                  <Button
                    variant="ghost"
                    disabled={!termGate.allowed}
                    title={termGate.reason ?? MODVIEW_COPY.termRemove.replace('{term}', entry)}
                    onClick={() => onAct({ kind: 'term', list, term: entry, remove: true })}
                  >
                    {entry}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <form
            className={MODVIEW_MODES.termForm}
            onSubmit={(event) => {
              event.preventDefault()
              if (!term.trim()) return
              onAct({ kind: 'term', list, term: term.trim(), remove: false })
              setTerm('')
            }}
          >
            <input
              className={MODVIEW_MODES.termInput}
              placeholder={MODVIEW_COPY.termPlaceholder}
              aria-label={MODVIEW_COPY.termPlaceholder}
              disabled={!termGate.allowed}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={!termGate.allowed}>
              {MODVIEW_COPY.termAdd}
            </Button>
          </form>
          {!termGate.allowed && <p className={MODVIEW_MODES.reason}>{termGate.reason}</p>}
        </div>
      )}
    </div>
  )
}
