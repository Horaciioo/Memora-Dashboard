'use client'

import { useState } from 'react'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { TermsDrawer } from '@/composites/modview/TermsDrawer'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { CHAT_MODES, MODVIEW_DEFAULTS } from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_MODES } from '@/declarations/ui/variants'
import type { ChatModeName, ModViewState } from '@/types/modview'

export interface ChatModesMenuProps {
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
  // Terms drawers offered, absent where the grid is fixed
  hasTerms?: boolean
}

// Twitch exposes no allowed terms
const TERM_LISTS = ['blocked'] as const

/**
 * Whether one mode is on
 * @param {ModViewState['modes']} modes - Modes in force
 * @param {ChatModeName} mode - Mode
 * @return {boolean} - On
 */

const isOn = (modes: ModViewState['modes'], mode: ChatModeName): boolean =>
  mode === 'slow' ? modes.slowSeconds !== null : modes[mode]

/**
 * Chat modes and term boxes
 * @param {ModViewState} state - Mod View state
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @param {boolean} [hasTerms] - Terms drawers offered
 * @return {JSX.Element}
 */

export const ChatModesMenu = ({ state, gate, onAct, hasTerms }: ChatModesMenuProps) => {
  const OpenIcon = ICONS.next
  const [terms, setTerms] = useState<'blocked' | 'allowed' | null>(null)

  return (
    <div className={MODVIEW_MODES.panel} role="menu" aria-label={MODVIEW_COPY.modes}>
      {CHAT_MODES.keys.map((mode) => {
        const option = CHAT_MODES.get(mode)
        const Icon = ICONS[option.icon]
        const on = isOn(state.modes, mode)
        const check = gate({ kind: 'mode', mode, enabled: !on })

        return (
          <div key={mode} className={MODVIEW_MODES.row} title={check.reason ?? undefined}>
            <Icon className={MODVIEW_MODES.rowIcon} aria-hidden="true" />
            <span className={MODVIEW_MODES.rowLabel}>{option.label}</span>
            <Toggle
              bare
              checked={on}
              disabled={!check.allowed}
              label={option.label}
              onChange={(enabled) =>
                onAct({ kind: 'mode', mode, enabled, seconds: MODVIEW_DEFAULTS.slowMode })
              }
            />
          </div>
        )
      })}

      {hasTerms &&
        TERM_LISTS.map((key) => {
          const label = key === 'blocked' ? MODVIEW_COPY.blockedTerms : MODVIEW_COPY.allowedTerms
          const check = gate({ kind: 'term', list: key, term: '', remove: false })

          return (
            <button
              key={key}
              type="button"
              className={MODVIEW_MODES.row}
              title={check.reason ?? undefined}
              disabled={!check.allowed}
              aria-pressed={terms === key}
              onClick={() => setTerms(terms === key ? null : key)}
            >
              <ICONS.blockedTerms className={MODVIEW_MODES.rowIcon} aria-hidden="true" />
              <span className={MODVIEW_MODES.rowLabel}>{label}</span>
              <OpenIcon className={MODVIEW_MODES.rowIcon} aria-hidden="true" />
            </button>
          )
        })}

      {terms && (
        <TermsDrawer
          list={terms}
          state={state}
          gate={gate}
          onAct={onAct}
          onClose={() => setTerms(null)}
        />
      )}
    </div>
  )
}
