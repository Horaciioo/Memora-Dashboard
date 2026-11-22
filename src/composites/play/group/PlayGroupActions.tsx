import { fillPlayMessage, PLAY_GAMES, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_CREW } from '@/declarations/ui/variants'
import type { PlayGroupActionView } from '@/types/play'
import { formatClock, formatShortDay } from '@/utils/format/modview'

const SENTENCES = {
  joined: PLAY_GROUP_COPY.actionJoined,
  game: PLAY_GROUP_COPY.actionGame,
  quest: PLAY_GROUP_COPY.actionQuest,
  questDone: PLAY_GROUP_COPY.actionQuestDone,
} as const

/**
 * Actions tab: what happened in the group, newest first
 * @param {Object} props - Journal
 * @param {PlayGroupActionView[]} props.actions - Lines
 * @return {JSX.Element}
 */

export const PlayGroupActions = ({ actions }: { actions: PlayGroupActionView[] }) => (
  <div className={PLAY_CREW.tabBody}>
    <section className={PLAY_CREW.box}>
      <h2 className={PLAY_CREW.boxTitle}>{PLAY_GROUP_COPY.tabActions}</h2>
      {actions.length === 0 ? (
        <p className={PLAY_CREW.empty}>{PLAY_GROUP_COPY.actionsEmpty}</p>
      ) : (
        <ul className={PLAY_CREW.list}>
          {actions.map((action) => (
            <li key={action.id} className={PLAY_CREW.row}>
              <span className={PLAY_CREW.rowName}>
                <span className={PLAY_CREW.rowText}>
                  {fillPlayMessage(SENTENCES[action.kind], {
                    who: action.who ?? '',
                    what:
                      action.kind === 'game' && action.what
                        ? PLAY_GAMES.label(action.what as Parameters<typeof PLAY_GAMES.label>[0])
                        : (action.what ?? ''),
                  })}
                </span>
              </span>
              <span className={PLAY_CREW.time}>
                {formatShortDay(action.at)} {formatClock(action.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  </div>
)
