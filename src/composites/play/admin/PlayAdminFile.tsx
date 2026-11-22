'use client'

import { useState } from 'react'

import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayAdminLogs } from '@/composites/play/admin/PlayAdminLogs'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlayAdminPanel } from '@/composites/play/member/PlayAdminPanel'
import { PlayCareerCounters } from '@/composites/play/member/stats/PlayCareerCounters'
import { PlayCareerHero } from '@/composites/play/member/stats/PlayCareerHero'
import { PlayCareerRecord } from '@/composites/play/member/stats/PlayCareerRecord'
import { playPresenceLabel } from '@/core/lib/play/presence'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ADMIN, PLAY_BOX, PLAY_PAGE } from '@/declarations/ui/variants'
import type { PlayAdminState } from '@/types/play'

// Scope of the figures: every game together
const SCOPE_GLOBAL = ''

export interface PlayAdminFileProps {
  player: { accountId: string; name: string; avatarUrl: string | null }
  state: PlayAdminState
}

/**
 * File of one player: rank card, figures, progression, gestures, journal, all in Play colours
 * @param {PlayAdminFileProps} props - Player and Play state
 * @return {JSX.Element}
 */

export const PlayAdminFile = ({ player, state }: PlayAdminFileProps) => {
  const [scope, setScope] = useState(SCOPE_GLOBAL)
  const CopyIcon = ICONS.copy
  const BackIcon = ICONS.back
  const totals = state.games.find((entry) => entry.game === scope) ?? state.global

  return (
    <div className={PLAY_PAGE.frame}>
      <AppLink href={ROUTES.playAdmin} className={PLAY_ADMIN.back}>
        <BackIcon className={PLAY_ADMIN.backGlyph} aria-hidden="true" />
        {COPY.back}
      </AppLink>

      <PlayPageTitle
        aside={null}
        body={
          <>
            <PlayCareerHero totals={state.global} player={player} />
            <div className={PLAY_ADMIN.heroMeta}>
              {state.ban && <span className={PLAY_ADMIN.heroBanned}>{COPY.banned}</span>}
              <span className={PLAY_ADMIN.heroNow}>
                {state.presence ? playPresenceLabel(state.presence) : PLAY_MEMBER_COPY.noGame}
              </span>
            </div>
            <button
              type="button"
              title={ACTION_COPY.copyId}
              aria-label={ACTION_COPY.copyId}
              onClick={() => void navigator.clipboard.writeText(player.accountId)}
              className={PLAY_ADMIN.id}
            >
              <span className={PLAY_ADMIN.idText}>{player.accountId}</span>
              <CopyIcon className={PLAY_ADMIN.idGlyph} aria-hidden="true" />
            </button>
          </>
        }
      >
        {player.name}
      </PlayPageTitle>

      <PlayPageTitle
        heading="h2"
        body={
          <div className={PLAY_BOX.flat}>
            <div className={PLAY_ADMIN.scope}>
              <SelectMenu
                isPlay
                label={COPY.scopeLabel}
                mark="playGame"
                emptyLabel={PLAY_MEMBER_COPY.global}
                options={state.games
                  .filter((entry) => PLAY_GAMES.has(entry.game))
                  .map((entry) => ({
                    value: entry.game,
                    label: PLAY_GAMES.label(entry.game),
                    icon: entry.game,
                  }))}
                value={scope}
                onChange={setScope}
              />
            </div>
            <PlayCareerCounters totals={totals} />
            <PlayCareerRecord totals={totals} />
          </div>
        }
      >
        {COPY.sectionFigures}
      </PlayPageTitle>

      <PlayAdminPanel isPlay memberId={player.accountId} initial={state} />

      <PlayPageTitle heading="h2" body={<PlayAdminLogs playerId={player.accountId} />}>
        {COPY.sectionJournal}
      </PlayPageTitle>
    </div>
  )
}
