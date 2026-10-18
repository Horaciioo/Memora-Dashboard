'use client'

import { FlaggedText } from '@/composites/modview/FlaggedText'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import type { Watchlist } from '@/core/hooks/interaction/state/useWatchlist'
import { MODVIEW_WATCH_COPY as COPY } from '@/declarations/modview/watch'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_WATCH } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import { formatClock } from '@/utils/format/modview'

export interface WatchPanelProps {
  watchlist: Watchlist
  gate: GateCheck
  onAct: ActRunner
  onPick: (chatter: Chatter) => void
}

// Quick gestures on a watched line
const TOOLS = [
  { icon: 'modDelete', label: MODVIEW_COPY.quickDelete },
  { icon: 'modTimeout', label: MODVIEW_COPY.quickTimeout },
  { icon: 'modBan', label: MODVIEW_COPY.quickBan },
] as const

/**
 * Lines of the viewers under watch, apart from the chat
 * @param {WatchPanelProps} props - Panel props
 * @return {JSX.Element}
 */

export const WatchPanel = ({ watchlist, gate, onAct, onPick }: WatchPanelProps) => {
  const CloseIcon = ICONS.close

  if (watchlist.watched.length === 0) {
    return <WindowEmpty icon="visible" title={COPY.emptyTitle} body={COPY.emptyBody} />
  }

  return (
    <>
      <ul className={MODVIEW_WATCH.chips}>
        {watchlist.watched.map((chatter) => (
          <li key={chatter.id} className={MODVIEW_WATCH.chip}>
            <button
              type="button"
              style={chatter.colour ? { color: chatter.colour } : undefined}
              onClick={() => onPick(chatter)}
              title={COPY.dossier}
            >
              {chatter.name}
            </button>
            <button
              type="button"
              className={MODVIEW_WATCH.chipClose}
              aria-label={COPY.stopNamed.replace('{name}', chatter.name)}
              onClick={() => watchlist.unwatch(chatter.id)}
            >
              <CloseIcon className={MODVIEW_WATCH.chipIcon} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {watchlist.lines.length === 0 ? (
        <p className={MODVIEW_WATCH.silent}>{COPY.silent}</p>
      ) : (
        <ul className={MODVIEW_WATCH.lines}>
          {watchlist.lines.map((line) => {
            const chatterId = line.author.id
            const intents = [
              { kind: 'delete', messageId: line.id, chatterId } as const,
              { kind: 'timeout', chatterId, seconds: 600, reason: null } as const,
              { kind: 'ban', chatterId, reason: null } as const,
            ]

            return (
              <li key={line.id} className={MODVIEW_WATCH.line}>
                <time className={MODVIEW_WATCH.time} dateTime={line.sentAt}>
                  {formatClock(line.sentAt)}
                </time>
                <button
                  type="button"
                  className={MODVIEW_WATCH.name}
                  style={line.author.colour ? { color: line.author.colour } : undefined}
                  onClick={() => onPick(line.author)}
                >
                  {line.author.name}
                </button>
                {': '}
                <FlaggedText text={line.text} flagged={line.flagged} />
                {!line.deletedBy && (
                  <span className={MODVIEW_WATCH.tools}>
                    {TOOLS.map((tool, index) => {
                      const check = gate(intents[index]!)
                      const Icon = ICONS[tool.icon]

                      return (
                        <button
                          key={tool.icon}
                          type="button"
                          className={MODVIEW_WATCH.tool}
                          disabled={!check.allowed}
                          title={check.reason ?? tool.label}
                          aria-label={tool.label}
                          onClick={() => onAct(intents[index]!)}
                        >
                          <Icon className={MODVIEW_WATCH.toolIcon} aria-hidden="true" />
                        </button>
                      )
                    })}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
