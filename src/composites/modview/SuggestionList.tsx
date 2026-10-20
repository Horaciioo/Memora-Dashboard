'use client'

import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import type { Suggestion } from '@/core/lib/modview/suggest'
import { MODVIEW_SUGGESTION_COPY as COPY, shortMeasure } from '@/declarations/modview/suggestions'
import { MODVIEW_SUGGEST, MODVIEW_VERDICT } from '@/declarations/ui/variants'
import type { Chatter, ModViewIntent } from '@/types/modview'

export interface SuggestionListProps {
  suggestions: Suggestion[]
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
  gate,
  onAct,
  onUse,
  onPick,
  onWatch,
  onDismiss,
}: SuggestionListProps) => {
  return (
    <>
      {suggestions.length === 0 ? (
        <WindowEmpty icon="spark" title={COPY.emptyTitle} body={COPY.emptyBody} />
      ) : (
        <ul className={MODVIEW_SUGGEST.list}>
          {suggestions.map((suggestion) => {
            const { source, offense, rung, rungCount, measure, command } = suggestion
            const id = source.id
            const isHeld = source.origin === 'automod'
            const removal: ModViewIntent = isHeld
              ? { kind: 'automod', heldId: id, approve: false }
              : { kind: 'delete', messageId: id, chatterId: source.chatter.id }
            const removable = gate(removal)
            const verdict = MODVIEW_VERDICT[measure?.kind ?? 'DELETE'] ?? MODVIEW_VERDICT.DELETE
            const stepLabel =
              rung === null
                ? null
                : COPY.step.replace('{n}', String(rung + 1)).replace('{total}', String(rungCount))

            // A command clears the box once sent, a removal at once
            const accept = () => {
              if (command) {
                onUse(suggestion)
                return
              }
              onAct(removal, offense && rung !== null ? { offenseId: offense.id, rung } : {})
              onDismiss(id)
            }
            const canAccept = command ? true : removable.allowed

            return (
              <li key={id} className={MODVIEW_SUGGEST.card}>
                <div className={MODVIEW_SUGGEST.verdictBlock}>
                  <p className={MODVIEW_SUGGEST.verdict}>
                    <span className={verdict.text}>
                      {shortMeasure(measure?.name ?? offense?.name ?? COPY.title)}
                    </span>
                    {` ${COPY.link} `}
                    <button
                      type="button"
                      className={MODVIEW_SUGGEST.who}
                      onClick={() => onPick(source.chatter)}
                    >
                      {source.chatter.name}
                    </button>
                  </p>
                  {stepLabel && <p className={MODVIEW_SUGGEST.step}>{stepLabel}</p>}
                </div>

                <p className={offense ? MODVIEW_SUGGEST.why : MODVIEW_SUGGEST.none}>
                  {offense?.name ?? COPY.noOffense}
                </p>

                <p className={MODVIEW_SUGGEST.quote}>
                  <FlaggedText text={source.text} flagged={source.flagged} />
                </p>

                {command ? (
                  <p className={MODVIEW_SUGGEST.command}>{command}</p>
                ) : (
                  offense && <p className={MODVIEW_SUGGEST.none}>{COPY.noCommand}</p>
                )}

                <div className={MODVIEW_SUGGEST.divider} role="separator" />

                <div className={MODVIEW_SUGGEST.actions}>
                  <Button
                    variant="ghost"
                    icon="visible"
                    className={MODVIEW_SUGGEST.watch}
                    aria-label={COPY.watch}
                    title={COPY.watch}
                    onClick={() => onWatch(source.chatter)}
                  />
                  <Button
                    variant="ghost"
                    icon="check"
                    className={MODVIEW_SUGGEST.accept}
                    aria-label={COPY.accept}
                    title={removable.reason && !command ? removable.reason : COPY.accept}
                    disabled={!canAccept}
                    onClick={accept}
                  />
                  <Button
                    variant="ghost"
                    icon="close"
                    className={MODVIEW_SUGGEST.refuse}
                    aria-label={COPY.refuse}
                    title={COPY.refuse}
                    onClick={() => onDismiss(id)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
