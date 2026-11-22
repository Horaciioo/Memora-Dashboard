import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { fillPlayMessage, PLAY_GAMES, PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_CREW } from '@/declarations/ui/variants'
import type { PlayGroupOverview, PlayGroupView } from '@/types/play'

/**
 * Statistics tab: the group's totals, then each member's share
 * @param {Object} props - Group and its overview
 * @param {PlayGroupView} props.group - Group
 * @param {PlayGroupOverview} props.overview - Statistics
 * @return {JSX.Element}
 */

export const PlayGroupStats = ({
  group,
  overview,
}: {
  group: PlayGroupView
  overview: PlayGroupOverview
}) => {
  const { stats } = overview
  const names = new Map(group.members.map((member) => [member.accountId, member]))
  const tiles = [
    { label: PLAY_GROUP_COPY.statTogether, value: stats.together },
    { label: PLAY_GROUP_COPY.statPlayed, value: stats.played },
    { label: PLAY_GROUP_COPY.statWins, value: stats.wins },
    { label: PLAY_GROUP_COPY.statQuests, value: stats.questsDone },
    {
      label: PLAY_GROUP_COPY.statFavourite,
      value: stats.favourite ? PLAY_GAMES.label(stats.favourite) : PLAY_GROUP_COPY.statNone,
    },
  ]

  return (
    <div className={PLAY_CREW.tabBody}>
      <div className={PLAY_CREW.tiles}>
        {tiles.map((tile) => (
          <div key={tile.label} className={PLAY_CREW.tile}>
            <span className={PLAY_CREW.tileValue}>{tile.value}</span>
            <span className={PLAY_CREW.tileLabel}>{tile.label}</span>
          </div>
        ))}
      </div>
      <section className={PLAY_CREW.box}>
        <h2 className={PLAY_CREW.boxTitle}>{PLAY_GROUP_COPY.statMembers}</h2>
        <ul className={PLAY_CREW.list}>
          {stats.members.map((row) => {
            const member = names.get(row.accountId)

            return member ? (
              <li key={row.accountId} className={PLAY_CREW.row}>
                <PlayAvatar
                  accountId={member.accountId}
                  name={member.name}
                  src={member.avatarUrl}
                  size="xs"
                />
                <span className={PLAY_CREW.rowName}>
                  <span className={PLAY_CREW.rowText}>{member.name}</span>
                </span>
                <span className={PLAY_CREW.state}>
                  {fillPlayMessage(PLAY_GROUP_COPY.statLine, {
                    played: row.played,
                    wins: row.wins,
                  })}
                </span>
                <span className={PLAY_CREW.stateOn}>
                  {fillPlayMessage(PLAY_GROUP_COPY.statXp, { xp: row.xp })}
                </span>
              </li>
            ) : null
          })}
        </ul>
      </section>
    </div>
  )
}
