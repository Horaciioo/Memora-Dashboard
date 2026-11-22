'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { Section } from '@/components/structures/page/Section'
import { AdminCell } from '@/composites/members/admin/AdminCell'
import { PlayAdminCell } from '@/composites/play/admin/PlayAdminCell'
import { PlayAdminProgress } from '@/composites/play/admin/PlayAdminProgress'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlayProgressCards } from '@/composites/play/member/PlayProgressCards'
import { usePlayAdmin } from '@/core/hooks/data/play/usePlayAdmin'
import { playPresenceLabel } from '@/core/lib/play/presence'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_ADMIN_FIELDS, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import type { PlayAdminDrawer } from '@/declarations/play/admin'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { MEMBER_ADMIN, PLAY_ADMIN, PLAY_MEMBER } from '@/declarations/ui/variants'
import type { PlayAdminState } from '@/types/play'
import type { FormValues } from '@/types/forms'
import { formatDay } from '@/utils/format/time/dates'

type Confirm = 'remove' | 'wipe'

// Blocks of the panel
export type PlayAdminSection = 'progress' | 'actions' | 'game' | 'access'

export interface PlayAdminPanelProps {
  memberId: string
  initial: PlayAdminState
  // Blocks drawn, every one without
  only?: PlayAdminSection | PlayAdminSection[]
  // Play colours instead of the dashboard ones
  isPlay?: boolean
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
 * Titled block of the panel, a ribbon box in Play colours or a raised section
 * @param {Object} props - Block
 * @return {JSX.Element}
 */

const Block = ({
  isPlay,
  title,
  children,
}: {
  isPlay?: boolean
  title: string
  children: ReactNode
}) =>
  isPlay ? (
    <PlayPageTitle heading="h2" className={PLAY_ADMIN.cell} body={children}>
      {title}
    </PlayPageTitle>
  ) : (
    <Section title={title} raised>
      {children}
    </Section>
  )

/**
 * Play view of the Admin tab: levels, current game, access, gestures
 * @param {PlayAdminPanelProps} props - Member and resolved state
 * @return {JSX.Element}
 */

export const PlayAdminPanel = ({ memberId, initial, only, isPlay }: PlayAdminPanelProps) => {
  const play = usePlayAdmin(memberId, initial)
  const [drawer, setDrawer] = useState<{ kind: PlayAdminDrawer; values?: FormValues } | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const { ban, presence } = play.state
  const shows = (section: PlayAdminSection) =>
    !only || (Array.isArray(only) ? only.includes(section) : only === section)

  const Cell = isPlay ? PlayAdminCell : AdminCell
  const cells = isPlay ? PLAY_ADMIN.cells : MEMBER_ADMIN.split
  const emptyClass = isPlay ? PLAY_ADMIN.note : PLAY_MEMBER.empty

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
    <div className={isPlay ? PLAY_ADMIN.cols : PLAY_MEMBER.stack}>
      {shows('progress') && (
        <Block isPlay={isPlay} title={PLAY_MEMBER_COPY.sectionProgress}>
          {isPlay ? (
            <PlayAdminProgress
              state={play.state}
              onSelect={(game) => setDrawer({ kind: 'xp', values: { game } })}
            />
          ) : (
            <PlayProgressCards
              state={play.state}
              onSelect={(game) => setDrawer({ kind: 'xp', values: { game } })}
            />
          )}
        </Block>
      )}

      {shows('actions') && (
        <Block isPlay={isPlay} title={PLAY_MEMBER_COPY.sectionActions}>
          <div className={cells}>
            <Cell
              label={PLAY_MEMBER_COPY.xpAction}
              note={PLAY_MEMBER_COPY.xpNote}
              onClick={() => setDrawer({ kind: 'xp' })}
            />
            <Cell
              label={PLAY_MEMBER_COPY.levelAction}
              note={PLAY_MEMBER_COPY.levelNote}
              onClick={() => setDrawer({ kind: 'level' })}
            />
            <Cell
              label={PLAY_MEMBER_COPY.statsAction}
              note={PLAY_MEMBER_COPY.statsNote}
              onClick={() => setDrawer({ kind: 'stats' })}
            />
            <Cell
              variant="danger"
              label={PLAY_MEMBER_COPY.resetAction}
              note={PLAY_MEMBER_COPY.resetNote}
              onClick={() => setDrawer({ kind: 'reset' })}
            />
            <Cell
              variant="danger"
              label={PLAY_MEMBER_COPY.wipeAction}
              note={PLAY_MEMBER_COPY.wipeNote}
              onClick={() => setConfirm('wipe')}
            />
          </div>
        </Block>
      )}

      {shows('game') && (
        <Block isPlay={isPlay} title={PLAY_MEMBER_COPY.sectionGame}>
          {presence ? (
            <div className={cells}>
              <Cell
                variant="danger"
                label={PLAY_MEMBER_COPY.removeAction}
                note={playPresenceLabel(presence)}
                onClick={() => setConfirm('remove')}
              />
            </div>
          ) : (
            <p className={emptyClass}>{PLAY_MEMBER_COPY.noGame}</p>
          )}
        </Block>
      )}

      {shows('access') && (
        <Block isPlay={isPlay} title={PLAY_MEMBER_COPY.sectionAccess}>
          <div className={cells}>
            {ban ? (
              <Cell
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
              <Cell
                variant="danger"
                label={PLAY_MEMBER_COPY.banAction}
                note={PLAY_MEMBER_COPY.banNote}
                onClick={() => setDrawer({ kind: 'ban' })}
              />
            )}
          </div>
        </Block>
      )}

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
