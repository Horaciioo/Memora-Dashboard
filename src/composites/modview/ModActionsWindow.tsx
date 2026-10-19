'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { ActSentence } from '@/composites/modview/ActSentence'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { memberMenu, memberNamed } from '@/composites/modview/memberMenu'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { useMenu } from '@/managers/front-end'
import { MODVIEW_ACT_COPY, MODVIEW_COPY, MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
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
  // Moderator followed in Focus mode
  focusLogin?: string | null
  // Right click on a moderator
  team?: TeamTools
}

/**
 * Every moderation act of the team
 * @param {ModAct[]} acts - Acts
 * @param {boolean} isLit - Lit by a scene
 * @param {(name: string) => void} onPickTarget - Open a viewer card
 * @param {string | null} [focusLogin] - Moderator followed
 * @param {TeamTools} [team] - Focus gestures
 * @return {JSX.Element}
 */

export const ModActionsWindow = ({
  acts,
  isLit,
  onPickTarget,
  focusLogin,
  team,
}: ModActionsWindowProps) => {
  const { contextMenu } = useMenu()

  return (
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
            const isFocused =
              Boolean(focusLogin) && act.moderator.toLowerCase() === focusLogin?.toLowerCase()

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
                    <ActSentence
                      text={MODVIEW_ACT_COPY[act.kind]}
                      verb={MOD_ACTS.get(act.kind).verb}
                      tone={MOD_ACTS.get(act.kind).tone}
                    />{' '}
                    <span
                      className={cn(MODVIEW_FEED.who, isFocused && MODVIEW_FEED.whoFocus)}
                      onContextMenu={(event) => {
                        const member = team ? memberNamed(act.moderator, team.members) : null
                        if (team && member)
                          contextMenu(memberMenu(member, team), member.name)(event)
                      }}
                    >
                      {act.moderator}
                    </span>
                    {isFocused && (
                      <span className={MODVIEW_FEED.focusTag}>{MODVIEW_INSPECT_COPY.focusTag}</span>
                    )}
                    {act.durationSeconds
                      ? ` ${MODVIEW_COPY.during} ${formatDuration(act.durationSeconds)}`
                      : ''}
                    <DotMark />
                    {act.pending ? MODVIEW_COPY.pending : formatSince(act.at)}
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
}
