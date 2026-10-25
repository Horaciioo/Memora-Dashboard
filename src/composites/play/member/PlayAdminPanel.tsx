'use client'

import { useState } from 'react'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { Section } from '@/components/structures/page/Section'
import { AdminCell } from '@/composites/members/admin/AdminCell'
import { PlayProgressList } from '@/composites/play/member/PlayProgressList'
import { usePlayAdmin } from '@/core/hooks/data/play/usePlayAdmin'
import { playPresenceLabel } from '@/core/lib/play/presence'
import { PLAY_ADMIN_FIELDS, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { MEMBER_ADMIN, PLAY_MEMBER } from '@/declarations/ui/variants'
import type { PlayAdminState } from '@/types/play'
import type { FormValues } from '@/types/forms'

type Drawer = keyof typeof PLAY_ADMIN_FIELDS

export interface PlayAdminPanelProps {
  memberId: string
  initial: PlayAdminState
}

// Title of each drawer
const DRAWER_TITLES: Record<Drawer, string> = {
  xp: PLAY_MEMBER_COPY.xpAction,
  level: PLAY_MEMBER_COPY.levelAction,
  reset: PLAY_MEMBER_COPY.resetAction,
}

/**
 * Play view of the Admin tab: levels, current game, gestures
 * @param {PlayAdminPanelProps} props - Member and resolved state
 * @return {JSX.Element}
 */

export const PlayAdminPanel = ({ memberId, initial }: PlayAdminPanelProps) => {
  const play = usePlayAdmin(memberId, initial)
  const [drawer, setDrawer] = useState<Drawer | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Gesture behind each drawer
  const submit: Record<Drawer, (values: FormValues) => Promise<boolean>> = {
    xp: play.adjustXp,
    level: play.setLevel,
    reset: play.reset,
  }

  return (
    <div className={PLAY_MEMBER.stack}>
      <Section title={PLAY_MEMBER_COPY.sectionProgress} raised>
        <PlayProgressList global={play.state.global} games={play.state.games} />
      </Section>

      <Section title={PLAY_MEMBER_COPY.sectionGame} raised>
        {play.state.presence ? (
          <div className={MEMBER_ADMIN.split}>
            <AdminCell
              variant="danger"
              label={PLAY_MEMBER_COPY.removeAction}
              note={playPresenceLabel(play.state.presence)}
              onClick={() => setIsRemoving(true)}
            />
          </div>
        ) : (
          <p className={PLAY_MEMBER.empty}>{PLAY_MEMBER_COPY.noGame}</p>
        )}
      </Section>

      <Section title={PLAY_MEMBER_COPY.sectionActions} raised>
        <div className={MEMBER_ADMIN.split}>
          <AdminCell
            label={PLAY_MEMBER_COPY.xpAction}
            note={PLAY_MEMBER_COPY.xpNote}
            onClick={() => setDrawer('xp')}
          />
          <AdminCell
            label={PLAY_MEMBER_COPY.levelAction}
            note={PLAY_MEMBER_COPY.levelNote}
            onClick={() => setDrawer('level')}
          />
          <AdminCell
            variant="danger"
            label={PLAY_MEMBER_COPY.resetAction}
            note={PLAY_MEMBER_COPY.resetNote}
            onClick={() => setDrawer('reset')}
          />
        </div>
      </Section>

      <FormDrawer
        subject={FORM_SUBJECTS.playStats}
        open={drawer !== null}
        title={drawer ? DRAWER_TITLES[drawer] : ''}
        fields={drawer ? PLAY_ADMIN_FIELDS[drawer] : []}
        issues={play.issues}
        isSaving={play.isSaving}
        onSubmit={async (values) => (drawer ? submit[drawer](values) : false)}
        onClose={() => setDrawer(null)}
      />

      {isRemoving && (
        <ConfirmDialog
          open
          title={PLAY_MEMBER_COPY.removeConfirmTitle}
          description={PLAY_MEMBER_COPY.removeConfirmDescription}
          pending={play.isSaving}
          onCancel={() => setIsRemoving(false)}
          onConfirm={() => void play.remove().then(() => setIsRemoving(false))}
        />
      )}
    </div>
  )
}
