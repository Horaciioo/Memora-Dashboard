'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import type { Suggestion } from '@/core/lib/modview/suggest'
import { MODVIEW_SUGGESTION_COPY as COPY } from '@/declarations/modview/suggestions'
import { MODVIEW_SUGGEST } from '@/declarations/ui/variants'
import type { Chatter, ModViewIntent } from '@/types/modview'
import { formatSince } from '@/utils/format/dates'

export interface SuggestionListProps {
  suggestions: Suggestion[]
  levelName: string | null
  gate: GateCheck
  onAct: ActRunner
  // Put a line in the chat box
  onUse: (suggestion: Suggestion) => void
  onPick: (chatter: Chatter) => void
  onWatch: (chatter: Chatter) => void
  onDismiss: (id: string) => void
}

/**
 * Commands ready to paste, one per message the AutoMod or a flag points at
 * @param {SuggestionListProps} props - List props
 * @return {JSX.Element}
 */

export const SuggestionList = ({
  suggestions,
  levelName,
  gate,
  onAct,
  onUse,
  onPick,
  onWatch,
  onDismiss,
}: SuggestionListProps) => {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (id: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(id)
    } catch {
      // Clipboard blocked: the line stays selectable
    }
  }

  return (
    <>
      {suggestions.length === 0 ? (
        <WindowEmpty icon="spark" title={COPY.emptyTitle} body={COPY.emptyBody} />
      ) : (
        <ul className={MODVIEW_SUGGEST.list}>
          {suggestions.map((suggestion) => {
            const { source, offense, rung, rungCount, command } = suggestion
            const id = source.id
            const isHeld = source.origin === 'automod'
            const removal: ModViewIntent = isHeld
              ? { kind: 'automod', heldId: id, approve: false }
              : { kind: 'delete', messageId: id, chatterId: source.chatter.id }
            const removable = gate(removal)

            return (
              <li key={id} className={MODVIEW_SUGGEST.card}>
                <div className={MODVIEW_SUGGEST.head}>
                  <button
                    type="button"
                    className={MODVIEW_SUGGEST.who}
                    style={source.chatter.colour ? { color: source.chatter.colour } : undefined}
                    onClick={() => onPick(source.chatter)}
                  >
                    {source.chatter.name}
                  </button>
                  <span className={MODVIEW_SUGGEST.meta}>
                    {`${source.origin === 'automod' ? COPY.fromAutomod : COPY.fromChat} · ${formatSince(source.at)}`}
                  </span>
                </div>

                <p className={MODVIEW_SUGGEST.quote}>
                  <FlaggedText text={source.text} flagged={source.flagged} />
                </p>

                {offense && rung !== null ? (
                  <p className={MODVIEW_SUGGEST.offense}>
                    {offense.name}
                    <span className={MODVIEW_SUGGEST.step}>
                      {COPY.step
                        .replace('{n}', String(rung + 1))
                        .replace('{total}', String(rungCount))}
                    </span>
                    {levelName && <span className={MODVIEW_SUGGEST.meta}>{levelName}</span>}
                  </p>
                ) : (
                  <p className={MODVIEW_SUGGEST.none}>{COPY.noOffense}</p>
                )}

                {command ? (
                  <p className={MODVIEW_SUGGEST.command}>{command}</p>
                ) : (
                  offense && <p className={MODVIEW_SUGGEST.none}>{COPY.noCommand}</p>
                )}

                <div className={MODVIEW_SUGGEST.actions}>
                  {command && (
                    <>
                      <Button variant="primary" icon="copy" onClick={() => void copy(id, command)}>
                        {copied === id ? COPY.copied : COPY.copy}
                      </Button>
                      <Button variant="secondary" onClick={() => onUse(suggestion)}>
                        {COPY.paste}
                      </Button>
                    </>
                  )}
                  {!command && offense && (
                    <Button
                      variant="secondary"
                      disabled={!removable.allowed}
                      title={removable.reason ?? undefined}
                      onClick={() => onAct(removal)}
                    >
                      {isHeld ? COPY.deny : COPY.delete}
                    </Button>
                  )}
                  <Button variant="ghost" icon="visible" onClick={() => onWatch(source.chatter)}>
                    {COPY.watch}
                  </Button>
                  <Button variant="ghost" onClick={() => onDismiss(id)}>
                    {COPY.dismiss}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
