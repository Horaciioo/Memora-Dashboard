'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

type Entry = PlayProfileView['games'][number]

const FILTERS: Record<string, { label: string; icon: string; score: (entry: Entry) => number }> = {
  level: { label: PLAY_HUB_COPY.pickLevel, icon: 'star', score: (entry) => entry.xp },
  time: { label: PLAY_HUB_COPY.pickTime, icon: 'clock', score: (entry) => entry.playSeconds },
  played: { label: PLAY_HUB_COPY.pickPlayed, icon: 'trophy', score: (entry) => entry.played },
}

/**
 * Game menu and a second menu of filters
 * @param {Object} props - Picker
 * @param {PlayGameName | null} props.current - Chosen game
 * @param {Entry[]} props.games - Own per-game figures
 * @return {JSX.Element}
 */

export const PlayGamePicker = ({
  current,
  games,
}: {
  current: PlayGameName | null
  games: Entry[]
}) => {
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const open = (slug: string) => router.push(slug ? ROUTES.playStatsGame(slug) : ROUTES.playStats)

  // Jump to the game that tops the chosen filter
  const pick = (key: string) => {
    setFilter(key)
    const played = games.filter(({ game, played }) => PLAY_GAMES.get(game).playable && played > 0)
    const best = key
      ? [...played].sort((a, b) => FILTERS[key].score(b) - FILTERS[key].score(a))[0]
      : null
    open(best ? PLAY_GAMES.get(best.game).slug : '')
  }

  return (
    <div className={PLAY_CAREER.pickBar}>
      <SelectMenu
        isPlay
        label={PLAY_MOBILE_COPY.rankingGame}
        mark="playGame"
        emptyLabel={PLAY_MOBILE_COPY.gameAll}
        options={PLAY_GAMES.keys
          .filter((game) => PLAY_GAMES.get(game).playable)
          .map((game) => ({
            value: PLAY_GAMES.get(game).slug,
            label: PLAY_GAMES.label(game),
            icon: game,
          }))}
        value={current ? PLAY_GAMES.get(current).slug : ''}
        onChange={(slug) => {
          setFilter('')
          open(slug)
        }}
      />
      <SelectMenu
        isPlay
        label={PLAY_HUB_COPY.pickFilter}
        emptyLabel={PLAY_HUB_COPY.pickNone}
        emptyIcon="close"
        options={Object.entries(FILTERS).map(([value, { label, icon }]) => ({
          value,
          label,
          icon,
        }))}
        value={filter}
        onChange={pick}
      />
    </div>
  )
}
