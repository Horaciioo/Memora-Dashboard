'use client'

import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_FEED } from '@/declarations/ui/variants'
import type { HeldMessage } from '@/types/modview'
import { formatSince } from '@/utils/format/dates'

export interface AutoModWindowProps {
  held: HeldMessage[]
  isLit: boolean
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Messages the automod holds
 * @param {HeldMessage[]} held - Held messages
 * @param {boolean} isLit - Lit by a scene
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @return {JSX.Element}
 */

export const AutoModWindow = ({ held, isLit, gate, onAct }: AutoModWindowProps) => (
  <ModWindow title={MODVIEW_COPY.automod} isLit={isLit} grow>
    {held.length === 0 ? (
      <WindowEmpty
        icon="automod"
        title={MODVIEW_COPY.automodEmptyTitle}
        body={MODVIEW_COPY.automodEmptyBody}
      />
    ) : (
      <ul className={MODVIEW_FEED.list}>
        {held.map((entry) => {
          const check = gate({ kind: 'automod', heldId: entry.id, approve: true })

          return (
            <li key={entry.id} className={MODVIEW_FEED.item}>
              <div className={MODVIEW_FEED.main}>
                <span className={MODVIEW_FEED.category}>{entry.category}</span>
                <p>
                  <span className={MODVIEW_FEED.who}>{entry.author.name}</span>
                  {` · ${formatSince(entry.at)}`}
                </p>
                <p className={MODVIEW_FEED.quote}>
                  <FlaggedText text={entry.text} flagged={entry.flagged} />
                </p>
                <div className={MODVIEW_FEED.actions}>
                  <Button
                    variant="success"
                    disabled={!check.allowed}
                    title={check.reason ?? undefined}
                    onClick={() => onAct({ kind: 'automod', heldId: entry.id, approve: true })}
                  >
                    {MODVIEW_COPY.approve}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={!check.allowed}
                    title={check.reason ?? undefined}
                    onClick={() => onAct({ kind: 'automod', heldId: entry.id, approve: false })}
                  >
                    {MODVIEW_COPY.deny}
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )}
  </ModWindow>
)
