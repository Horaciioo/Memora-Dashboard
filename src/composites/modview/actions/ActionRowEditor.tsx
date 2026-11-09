'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ColourField } from '@/components/elements/forms/pickers/ColourField'
import { Input } from '@/components/elements/forms/inputs/Input'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { formatDuration, parseDuration } from '@/core/lib/modview/commands'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import {
  MODVIEW_ACTION_ICONS,
  MODVIEW_ACTION_ICON_NAMES,
  MODVIEW_ACTION_KINDS,
  MODVIEW_ACTION_KIND_NAMES,
  MODVIEW_ACTION_LIMITS,
  MODVIEW_ACTION_LOOKS,
} from '@/declarations/modview/actions'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_ACTION_EDITOR } from '@/declarations/ui/variants'
import type { ModActionConfig, ModActionKind } from '@/types/modview'
import { cn } from '@/utils/classnames'

const KIND_OPTIONS = MODVIEW_ACTION_KIND_NAMES.map((value) => ({
  value,
  label: MODVIEW_ACTION_KINDS[value].label,
}))

export interface ActionRowEditorProps {
  action: ModActionConfig
  onChange: (patch: Partial<ModActionConfig>) => void
}

/**
 * Settings of one action: type, length, reason, glyph, look, colour
 * @param {ActionRowEditorProps} props - Action and change handler
 * @return {JSX.Element}
 */

export const ActionRowEditor = ({ action, onChange }: ActionRowEditorProps) => {
  const [length, setLength] = useState(action.seconds ? formatDuration(action.seconds) : '')
  const seconds = parseDuration(length)
  const isLengthValid = seconds !== null && seconds <= MODVIEW_ACTION_LIMITS.maxSeconds

  // A new type brings its own glyph and length
  const changeKind = (kind: ModActionKind) => {
    const nextSeconds =
      kind === 'timeout' ? (action.seconds ?? MODVIEW_ACTION_LIMITS.newSeconds) : null
    setLength(nextSeconds ? formatDuration(nextSeconds) : '')
    onChange({ kind, seconds: nextSeconds, icon: MODVIEW_ACTION_KINDS[kind].icon })
  }

  return (
    <div className={MODVIEW_ACTION_EDITOR.editor}>
      <div className={MODVIEW_ACTION_EDITOR.field}>
        <span className={MODVIEW_ACTION_EDITOR.label}>{MODVIEW_ACTION_COPY.kind}</span>
        <SelectMenu
          options={KIND_OPTIONS}
          value={action.kind}
          label={MODVIEW_ACTION_COPY.kind}
          onChange={(value) => changeKind(value as ModActionKind)}
        />
      </div>

      {MODVIEW_ACTION_KINDS[action.kind].needsLength && (
        <div className={MODVIEW_ACTION_EDITOR.field}>
          <span className={MODVIEW_ACTION_EDITOR.label}>{MODVIEW_ACTION_COPY.length}</span>
          <Input
            value={length}
            invalid={!isLengthValid}
            placeholder={MODVIEW_ACTION_COPY.lengthHint}
            aria-label={MODVIEW_ACTION_COPY.length}
            onChange={(event) => {
              setLength(event.target.value)
              const next = parseDuration(event.target.value)
              if (next !== null && next <= MODVIEW_ACTION_LIMITS.maxSeconds)
                onChange({ seconds: next })
            }}
          />
        </div>
      )}

      <div className={MODVIEW_ACTION_EDITOR.field}>
        <span className={MODVIEW_ACTION_EDITOR.label}>{MODVIEW_ACTION_COPY.reason}</span>
        <Input
          value={action.reason ?? ''}
          maxLength={MODVIEW_ACTION_LIMITS.maxReason}
          placeholder={MODVIEW_ACTION_COPY.reasonHint}
          aria-label={MODVIEW_ACTION_COPY.reason}
          onChange={(event) => onChange({ reason: event.target.value || null })}
        />
      </div>

      <div className={MODVIEW_ACTION_EDITOR.field}>
        <span className={MODVIEW_ACTION_EDITOR.label}>{MODVIEW_ACTION_COPY.icon}</span>
        <div
          className={MODVIEW_ACTION_EDITOR.icons}
          role="group"
          aria-label={MODVIEW_ACTION_COPY.icon}
        >
          {MODVIEW_ACTION_ICON_NAMES.map((name) => {
            const Icon = ICONS[name]

            return (
              <button
                key={name}
                type="button"
                className={cn(
                  MODVIEW_ACTION_EDITOR.iconButton,
                  action.icon === name && MODVIEW_ACTION_EDITOR.iconOn
                )}
                aria-pressed={action.icon === name}
                aria-label={MODVIEW_ACTION_ICONS[name].label}
                title={MODVIEW_ACTION_ICONS[name].label}
                onClick={() => onChange({ icon: name })}
              >
                <Icon className={MODVIEW_ACTION_EDITOR.iconGlyph} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      <div className={MODVIEW_ACTION_EDITOR.field}>
        <span className={MODVIEW_ACTION_EDITOR.label}>{MODVIEW_ACTION_COPY.look}</span>
        <div className={MODVIEW_ACTION_EDITOR.looks}>
          {MODVIEW_ACTION_LOOKS.map((look) => (
            <Button
              key={look}
              variant={action.look === look ? 'primary' : 'secondary'}
              aria-pressed={action.look === look}
              onClick={() => onChange({ look })}
            >
              {MODVIEW_ACTION_COPY.looks[look]}
            </Button>
          ))}
        </div>
      </div>

      <div className={MODVIEW_ACTION_EDITOR.field}>
        <span className={MODVIEW_ACTION_EDITOR.label}>{MODVIEW_ACTION_COPY.colour}</span>
        <div className={MODVIEW_ACTION_EDITOR.looks}>
          <ColourField
            id={`action-colour-${action.id}`}
            hasWheel
            label={MODVIEW_ACTION_COPY.colour}
            value={action.colour ?? ''}
            onChange={(colour) => onChange({ colour })}
          />
          {action.colour && (
            <Button variant="ghost" onClick={() => onChange({ colour: null })}>
              {MODVIEW_ACTION_COPY.colourNone}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
