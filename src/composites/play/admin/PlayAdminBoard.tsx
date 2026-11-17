'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayAdminBoard } from '@/core/hooks/data/play/usePlayAdminBoard'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage } from '@/declarations/play'
import {
  PLAY_ADMIN_FIELDS,
  PLAY_ADMIN_TARGETS,
  PLAY_BOARD_ADMIN_COPY as COPY,
  PLAY_MEMBER_COPY,
} from '@/declarations/play/admin'
import { PLAY_GAMES } from '@/declarations/play/games'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { PLAY_ADMIN, PLAY_BOX } from '@/declarations/ui/variants'
import type { PlayAdminBoard, PlayAdminRow } from '@/types/play'
import type { FormValues } from '@/types/forms'

export interface PlayAdminBoardProps {
  board: PlayAdminBoard
  // Only the admin level reaches everyone
  canEveryone: boolean
}

/**
 * Play admin page: totals, XP for everyone, every player a click away
 * @param {PlayAdminBoardProps} props - Board and reach
 * @return {JSX.Element}
 */

export const PlayAdminBoardView = ({ board, canEveryone }: PlayAdminBoardProps) => {
  const actions = usePlayAdminBoard()
  const [search, setSearch] = useState('')
  const [player, setPlayer] = useState<PlayAdminRow | null>(null)
  const [everyone, setEveryone] = useState<'form' | FormValues | null>(null)

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return needle
      ? board.players.filter((entry) => entry.name.toLowerCase().includes(needle))
      : board.players
  }, [board.players, search])

  const totals = [
    [COPY.totalPlayers, board.totals.players],
    [COPY.totalActive, board.totals.active],
    [COPY.totalBanned, board.totals.banned],
    [COPY.totalXp, board.totals.xp],
  ] as const
  const pending = everyone && everyone !== 'form' ? everyone : null
  const targetName = pending
    ? pending.game === PLAY_ADMIN_TARGETS.global
      ? PLAY_MEMBER_COPY.global
      : PLAY_GAMES.label(String(pending.game) as Parameters<typeof PLAY_GAMES.label>[0])
    : ''

  return (
    <div className={PLAY_ADMIN.page}>
      <div className={PLAY_ADMIN.totals}>
        {totals.map(([label, value]) => (
          <div key={label} className={PLAY_ADMIN.total}>
            <span className={PLAY_ADMIN.totalValue}>{value.toLocaleString('fr-FR')}</span>
            <span className={PLAY_ADMIN.totalLabel}>{label}</span>
          </div>
        ))}
      </div>

      {canEveryone && (
        <div className={PLAY_ADMIN.everyone}>
          <div className={PLAY_ADMIN.everyoneText}>
            <h2 className={PLAY_ADMIN.everyoneTitle}>{COPY.everyoneTitle}</h2>
            <p className={PLAY_ADMIN.everyoneNote}>{COPY.everyoneNote}</p>
          </div>
          <Button variant="arcade" onClick={() => setEveryone('form')}>
            {COPY.everyoneAction}
          </Button>
        </div>
      )}

      <section className={PLAY_BOX.flat}>
        <h2 className={PLAY_ADMIN.everyoneTitle}>{COPY.playersTitle}</h2>
        <input
          type="search"
          value={search}
          placeholder={COPY.search}
          aria-label={COPY.search}
          onChange={(event) => setSearch(event.target.value)}
          className={PLAY_BOX.input}
        />
        {shown.length === 0 ? (
          <p className={PLAY_ADMIN.empty}>{COPY.empty}</p>
        ) : (
          <ul className={PLAY_ADMIN.list}>
            {shown.map((entry) => (
              <li key={entry.accountId} className="flex items-center gap-2">
                <button
                  type="button"
                  title={COPY.rowHint}
                  onClick={() => setPlayer(entry)}
                  className={PLAY_ADMIN.row}
                >
                  <PlayAvatar accountId={entry.accountId} name={entry.name} src={entry.avatarUrl} />
                  <span className={PLAY_ADMIN.rowText}>
                    <span className={PLAY_ADMIN.rowName}>{entry.name}</span>
                    {entry.bonusXp !== 0 && (
                      <span className={PLAY_ADMIN.rowNote}>
                        {fillPlayMessage(COPY.bonus, { xp: entry.bonusXp })}
                      </span>
                    )}
                  </span>
                  {entry.isBanned && <span className={PLAY_ADMIN.rowBanned}>{COPY.banned}</span>}
                  <span className={PLAY_ADMIN.rowLevel}>
                    {fillPlayMessage(COPY.levelShort, { level: entry.level })}
                  </span>
                  <span className={PLAY_ADMIN.rowXp}>
                    {fillPlayMessage(PLAY_MEMBER_COPY.xp, {
                      xp: entry.xp.toLocaleString('fr-FR'),
                    })}
                  </span>
                </button>
                <AppLink href={ROUTES.member(entry.accountId)} className={PLAY_ADMIN.rowFile}>
                  {COPY.file}
                </AppLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <FormDrawer
        key={player ? `player-${player.accountId}` : 'player-closed'}
        subject={FORM_SUBJECTS.playStats}
        open={player !== null}
        title={player ? player.name : ''}
        fields={PLAY_ADMIN_FIELDS.xp}
        initialValues={{ game: PLAY_ADMIN_TARGETS.global }}
        issues={actions.issues}
        isSaving={actions.isSaving}
        onSubmit={async (values) => (player ? actions.adjustOne(player.accountId, values) : false)}
        onClose={() => setPlayer(null)}
      />

      <FormDrawer
        key={everyone === 'form' ? 'everyone-open' : 'everyone-closed'}
        subject={FORM_SUBJECTS.playStats}
        open={everyone === 'form'}
        title={COPY.everyoneAction}
        fields={PLAY_ADMIN_FIELDS.xp}
        initialValues={{ game: PLAY_ADMIN_TARGETS.global }}
        issues={actions.issues}
        isSaving={false}
        onSubmit={async (values) => {
          setEveryone(values)

          return true
        }}
        onClose={() => setEveryone(null)}
      />

      {pending && (
        <ConfirmDialog
          open
          title={fillPlayMessage(COPY.everyoneConfirm, { amount: String(pending.amount) })}
          description={fillPlayMessage(COPY.everyoneDescription, {
            count: board.totals.players,
            target: targetName,
          })}
          pending={actions.isSaving}
          onCancel={() => setEveryone(null)}
          onConfirm={() => void actions.adjustAll(pending).then(() => setEveryone(null))}
        />
      )}
    </div>
  )
}
