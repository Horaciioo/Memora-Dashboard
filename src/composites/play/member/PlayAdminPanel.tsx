'use client'

import { useState } from 'react'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { Section } from '@/components/structures/page/Section'
import { AdminCell } from '@/composites/members/admin/AdminCell'
import { PlayProgressCards } from '@/composites/play/member/PlayProgressCards'
import { usePlayAdmin } from '@/core/hooks/data/play/usePlayAdmin'
import { playPresenceLabel } from '@/core/lib/play/presence'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_ADMIN_FIELDS, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import type { PlayAdminDrawer } from '@/declarations/play/admin'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { MEMBER_ADMIN, PLAY_MEMBER } from '@/declarations/ui/variants'
import type { PlayAdminState } from '@/types/play'
import type { FormValues } from '@/types/forms'
import { formatDay } from '@/utils/format/dates'

type Confirm = 'remove' | 'wipe'

export interface PlayAdminPanelProps {
  memberId: string
  initial: PlayAdminState
}

// Title of each drawer
const DRAWER_TITLES: Record<PlayAdminDrawer, string> = {
  xp: PLAY_MEMBER_COPY.xpAction,
  level: PLAY_MEMBER_COPY.levelAction,
  stats: PLAY_MEMBER_COPY.statsAction,
  reset: PLAY_MEMBER_COPY.resetAction,
  ban: PLAY_MEMBER_COPY.banAction,
}

// Copy of each confirmation
const CONFIRMS: Record<Confirm, { title: string; description: string }> = {
  remove: {
    title: PLAY_MEMBER_COPY.removeConfirmTitle,
    description: PLAY_MEMBER_COPY.removeConfirmDescription,
  },
  wipe: {
    title: PLAY_MEMBER_COPY.wipeConfirmTitle,
    description: PLAY_MEMBER_COPY.wipeConfirmDescription,
  },
}

/**
 * Play view of the Admin tab: levels, current game, access, gestures
 * @param {PlayAdminPanelProps} props - Member and resolved state
 * @return {JSX.Element}
 */

export const PlayAdminPanel = ({ memberId, initial }: PlayAdminPanelProps) => {
  const play = usePlayAdmin(memberId, initial)
  const [drawer, setDrawer] = useState<{ kind: PlayAdminDrawer; values?: FormValues } | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const { ban, presence } = play.state

  // Gesture behind each drawer and confirmation
  const submit: Record<PlayAdminDrawer, (values: FormValues) => Promise<boolean>> = {
    xp: play.adjustXp,
    level: play.setLevel,
    stats: play.correctStats,
    reset: play.reset,
    ban: play.ban,
  }
  const confirmed: Record<Confirm, () => Promise<boolean>> = {
    remove: play.remove,
    wipe: play.wipe,
  }

  // A game card opens with its own record
  const statsOf = (game: string): FormValues => {
    const entry = play.state.games.find((item) => item.game === game)

    return {
      game,
      wins: entry?.wins ?? 0,
      draws: entry?.draws ?? 0,
      losses: entry?.losses ?? 0,
      streak: entry?.streak ?? 0,
    }
  }

  return (
    <div className={PLAY_MEMBER.stack}>
      <Section title={PLAY_MEMBER_COPY.sectionProgress} raised>
        <PlayProgressCards
          state={play.state}
          onSelect={(game) => setDrawer({ kind: 'xp', values: { game } })}
        />
      </Section>

      <Section title={PLAY_MEMBER_COPY.sectionActions} raised>
        <div className={MEMBER_ADMIN.split}>
          <AdminCell
            label={PLAY_MEMBER_COPY.xpAction}
            note={PLAY_MEMBER_COPY.xpNote}
            onClick={() => setDrawer({ kind: 'xp' })}
          />
          <AdminCell
            label={PLAY_MEMBER_COPY.levelAction}
            note={PLAY_MEMBER_COPY.levelNote}
            onClick={() => setDrawer({ kind: 'level' })}
          />
          <AdminCell
            label={PLAY_MEMBER_COPY.statsAction}
            note={PLAY_MEMBER_COPY.statsNote}
            onClick={() => setDrawer({ kind: 'stats' })}
          />
          <AdminCell
            variant="danger"
            label={PLAY_MEMBER_COPY.resetAction}
            note={PLAY_MEMBER_COPY.resetNote}
            onClick={() => setDrawer({ kind: 'reset' })}
          />
          <AdminCell
            variant="danger"
            label={PLAY_MEMBER_COPY.wipeAction}
            note={PLAY_MEMBER_COPY.wipeNote}
            onClick={() => setConfirm('wipe')}
          />
        </div>
      </Section>

      <Section title={PLAY_MEMBER_COPY.sectionGame} raised>
        {presence ? (
          <div className={MEMBER_ADMIN.split}>
            <AdminCell
              variant="danger"
              label={PLAY_MEMBER_COPY.removeAction}
              note={playPresenceLabel(presence)}
              onClick={() => setConfirm('remove')}
            />
          </div>
        ) : (
          <p className={PLAY_MEMBER.empty}>{PLAY_MEMBER_COPY.noGame}</p>
        )}
      </Section>

      <Section title={PLAY_MEMBER_COPY.sectionAccess} raised>
        <div className={MEMBER_ADMIN.split}>
          {ban ? (
            <AdminCell
              label={PLAY_MEMBER_COPY.unbanAction}
              note={[
                fillPlayMessage(PLAY_MEMBER_COPY.bannedSince, { date: formatDay(ban.since) }),
                ban.reason,
              ]
                .filter(Boolean)
                .join('. ')}
              isLoading={play.isSaving}
              onClick={() => void play.unban()}
            />
          ) : (
            <AdminCell
              variant="danger"
              label={PLAY_MEMBER_COPY.banAction}
              note={PLAY_MEMBER_COPY.banNote}
              onClick={() => setDrawer({ kind: 'ban' })}
            />
          )}
        </div>
      </Section>

      <FormDrawer
        key={drawer ? `${drawer.kind}-${String(drawer.values?.game ?? '')}` : 'closed'}
        subject={FORM_SUBJECTS.playStats}
        open={drawer !== null}
        title={drawer ? DRAWER_TITLES[drawer.kind] : ''}
        fields={drawer ? PLAY_ADMIN_FIELDS[drawer.kind] : []}
        initialValues={
          drawer?.kind === 'stats' && drawer.values?.game
            ? statsOf(String(drawer.values.game))
            : drawer?.values
        }
        issues={play.issues}
        isSaving={play.isSaving}
        onSubmit={async (values) => (drawer ? submit[drawer.kind](values) : false)}
        onClose={() => setDrawer(null)}
      />

      {confirm && (
        <ConfirmDialog
          open
          title={CONFIRMS[confirm].title}
          description={CONFIRMS[confirm].description}
          pending={play.isSaving}
          onCancel={() => setConfirm(null)}
          onConfirm={() => void confirmed[confirm]().then(() => setConfirm(null))}
        />
      )}
    </div>
  )
}
