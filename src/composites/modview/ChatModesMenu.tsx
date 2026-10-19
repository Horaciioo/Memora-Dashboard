'use client'

import { Fragment, useState } from 'react'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { TermsDrawer } from '@/composites/modview/TermsDrawer'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import {
  CHAT_MODES,
  FOLLOWER_DURATIONS,
  MODVIEW_DEFAULTS,
  SLOW_DURATIONS,
} from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_MODES } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import type { ChatModeName, ModViewState } from '@/types/modview'
import { formatDuration } from '@/utils/format/modview'

export interface ChatModesMenuProps {
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
  // Terms drawers offered, absent where the grid is fixed
  hasTerms?: boolean
}

// Delays Twitch offers
// Follow ages Twitch offers, in seconds for the gesture
const FOLLOWER_OPTIONS: FieldOption[] = FOLLOWER_DURATIONS.map((entry) => ({
  value: String(entry.minutes * 60),
  label: entry.label,
}))

const SLOW_OPTIONS: FieldOption[] = SLOW_DURATIONS.map((seconds) => ({
  value: String(seconds),
  label: formatDuration(seconds),
}))

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
  // Validation then over-validation before the shield starts
  const [shieldStep, setShieldStep] = useState<0 | 1 | 2>(0)

  return (
    <div className={MODVIEW_MODES.panel} role="menu" aria-label={MODVIEW_COPY.modes}>
      {CHAT_MODES.keys.map((mode) => {
        const option = CHAT_MODES.get(mode)
        const Icon = ICONS[option.icon]
        const on = isOn(state.modes, mode)
        const check = gate({ kind: 'mode', mode, enabled: !on })

        return (
          <Fragment key={mode}>
            <div className={MODVIEW_MODES.row} title={check.reason ?? undefined}>
              <Icon className={MODVIEW_MODES.rowIcon} aria-hidden="true" />
              <span className={MODVIEW_MODES.rowLabel}>{option.label}</span>
              {mode === 'followers' ? (
                <SelectMenu
                  size="compact"
                  label={option.label}
                  options={FOLLOWER_OPTIONS}
                  emptyLabel={MODVIEW_COPY.followersOff}
                  value={
                    state.modes.followers ? String((state.modes.followerMinutes ?? 0) * 60) : ''
                  }
                  disabled={!check.allowed}
                  onChange={(value) =>
                    onAct({
                      kind: 'mode',
                      mode,
                      enabled: value !== '',
                      seconds: value === '' ? 0 : Number(value),
                    })
                  }
                />
              ) : mode === 'slow' ? (
                <SelectMenu
                  size="compact"
                  label={option.label}
                  options={SLOW_OPTIONS}
                  emptyLabel={MODVIEW_COPY.slowOff}
                  value={state.modes.slowSeconds === null ? '' : String(state.modes.slowSeconds)}
                  disabled={!check.allowed}
                  onChange={(value) =>
                    onAct({
                      kind: 'mode',
                      mode,
                      enabled: value !== '',
                      seconds: value === '' ? MODVIEW_DEFAULTS.slowMode : Number(value),
                    })
                  }
                />
              ) : (
                <Toggle
                  bare
                  checked={on}
                  disabled={!check.allowed}
                  label={option.label}
                  onChange={(enabled) =>
                    // The shield goes through two validations before it starts
                    mode === 'shield' && enabled
                      ? setShieldStep(1)
                      : onAct({ kind: 'mode', mode, enabled, seconds: MODVIEW_DEFAULTS.slowMode })
                  }
                />
              )}
            </div>
          </Fragment>
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

      <ConfirmDialog
        open={shieldStep === 1}
        title={MODVIEW_COPY.shieldAsk}
        description={MODVIEW_COPY.shieldAskBody}
        confirmLabel={MODVIEW_COPY.shieldAskConfirm}
        tone="warning"
        onConfirm={() => setShieldStep(2)}
        onCancel={() => setShieldStep(0)}
      />
      <ConfirmDialog
        open={shieldStep === 2}
        title={MODVIEW_COPY.shieldSure}
        description={MODVIEW_COPY.shieldSureBody}
        confirmLabel={MODVIEW_COPY.shieldSureConfirm}
        onConfirm={() => {
          setShieldStep(0)
          onAct({ kind: 'mode', mode: 'shield', enabled: true })
        }}
        onCancel={() => setShieldStep(0)}
      />

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
