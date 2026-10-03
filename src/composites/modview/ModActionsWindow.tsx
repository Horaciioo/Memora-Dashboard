'use client'

import { FlaggedText } from '@/composites/modview/FlaggedText'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { MODVIEW_ACT_COPY, MODVIEW_COPY } from '@/declarations/modview/copy'
import { MOD_ACTS } from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_FEED } from '@/declarations/ui/variants'
import type { ModAct } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/dates'
import { formatDuration } from '@/utils/format/modview'

export interface ModActionsWindowProps {
  acts: ModAct[]
  isLit: boolean
  onPickTarget: (name: string) => void
}

/**
 * Every moderation act of the team, newest first
 * @param {ModAct[]} acts - Acts
 * @param {boolean} isLit - Lit by a scene
 * @param {(name: string) => void} onPickTarget - Open a viewer card
 * @return {JSX.Element}
 */

export const ModActionsWindow = ({ acts, isLit, onPickTarget }: ModActionsWindowProps) => (
  <ModWindow title={MODVIEW_COPY.modActions} isLit={isLit} grow>
    {acts.length === 0 ? (
      <WindowEmpty
        icon="modActions"
        title={MODVIEW_COPY.actsEmptyTitle}
        body={MODVIEW_COPY.actsEmptyBody}
      />
    ) : (
      <ul className={MODVIEW_FEED.list}>
        {acts.map((act) => {
          const Icon = ICONS[MOD_ACTS.get(act.kind).icon]

          return (
            <li
              key={act.id}
              className={cn(MODVIEW_FEED.item, act.pending && MODVIEW_FEED.itemPending)}
            >
              <Icon className={MODVIEW_FEED.icon} aria-hidden="true" />
              <div className={MODVIEW_FEED.main}>
                {act.target && (
                  <button
                    type="button"
                    className={MODVIEW_FEED.target}
                    onClick={() => onPickTarget(act.target!)}
                  >
                    {act.target}
                  </button>
                )}
                <p className={MODVIEW_FEED.line}>
                  {MODVIEW_ACT_COPY[act.kind]}{' '}
                  <span className={MODVIEW_FEED.who}>{act.moderator}</span>
                  {act.durationSeconds
                    ? ` ${MODVIEW_COPY.during} ${formatDuration(act.durationSeconds)}`
                    : ''}
                  {` · ${act.pending ? MODVIEW_COPY.pending : formatSince(act.at)}`}
                </p>
                {act.quote && (
                  <p className={MODVIEW_FEED.quote}>
                    <FlaggedText text={act.quote} />
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    )}
  </ModWindow>
)
