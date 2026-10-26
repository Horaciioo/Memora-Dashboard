import type { GolfVoteCard } from '@/composites/play/golf/vote/GolfVoteDeck'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SETUP_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES, GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GOLF_MODE_ICONS, GOLF_VOTE_COPY } from '@/declarations/play/golf/vote'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import { GolfModes } from '@/utils/constants/play'
import type { GolfModeName } from '@/utils/constants/play'

// Label of each format
const MODE_LABELS: Record<GolfModeName, string> = {
  [GolfModes.Casual]: GOLF_SETUP_COPY.modeCasual,
  [GolfModes.Tournament]: GOLF_SETUP_COPY.modeTournament,
  [GolfModes.Chaos]: GOLF_SETUP_COPY.modeChaos,
}

// One line on what each format plays like
export const MODE_HINTS: Record<GolfModeName, string> = {
  [GolfModes.Casual]: GOLF_VOTE_COPY.casualHint,
  [GolfModes.Tournament]: GOLF_VOTE_COPY.tournamentHint,
  [GolfModes.Chaos]: GOLF_VOTE_COPY.chaosHint,
}

/**
 * Cards of the formats
 * @return {GolfVoteCard[]} - Cards
 */

export const modeCards = (): GolfVoteCard[] =>
  Object.values(GolfModes).map((mode) => {
    const Icon = ICONS[GOLF_MODE_ICONS[mode]]

    return {
      key: mode,
      label: MODE_LABELS[mode],
      face: <Icon className={GOLF_VOTE.glyph} aria-hidden="true" />,
    }
  })

/**
 * Cards of the tournament lengths
 * @return {GolfVoteCard[]} - Cards
 */

export const roundCards = (): GolfVoteCard[] =>
  GOLF_SETTINGS.tournament.maps.map((count) => ({
    key: String(count),
    label: fillPlayMessage(GOLF_SETUP_COPY.mapsCount, { count }),
    face: <span className={GOLF_VOTE.number}>{count}</span>,
  }))

/**
 * Cards of the courses, the random draw last
 * @param {Map<string, string>} shots - Thumbnails drawn so far
 * @return {GolfVoteCard[]} - Cards
 */

export const courseCards = (shots: Map<string, string>): GolfVoteCard[] => {
  const RandomIcon = ICONS.help

  return [...GOLF_COURSES.keys, GOLF_RANDOM_COURSE].map((key) => {
    const url = shots.get(key)

    return {
      key,
      label: key === GOLF_RANDOM_COURSE ? GOLF_SETUP_COPY.random : GOLF_COURSES.label(key),
      face:
        key === GOLF_RANDOM_COURSE ? (
          <RandomIcon className={GOLF_VOTE.glyph} aria-hidden="true" />
        ) : (
          url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className={GOLF_VOTE.shot} />
          )
        ),
    }
  })
}
