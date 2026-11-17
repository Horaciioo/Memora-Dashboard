'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { usePlayAdminBoard } from '@/core/hooks/data/play/usePlayAdminBoard'
import { fillPlayMessage } from '@/declarations/play'
import {
  PLAY_ADMIN_FIELDS,
  PLAY_ADMIN_TARGETS,
  PLAY_BOARD_ADMIN_COPY as COPY,
  PLAY_MEMBER_COPY,
} from '@/declarations/play/admin'
import { PLAY_GAMES } from '@/declarations/play/games'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { FormValues } from '@/types/forms'

export type BulkMode = 'give' | 'reset'

export interface PlayAdminBulkProps {
  // Drawer open, driven by the page
  form: BulkMode | null
  onForm: (mode: BulkMode | null) => void
  // Players chosen, none reaches everyone for XP
  selectedIds: string[]
  playerCount: number
  onClear: () => void
}

/**
 * XP for several players at once, or for everyone, and wiping the chosen ones
 * @param {PlayAdminBulkProps} props - Selection
 * @return {JSX.Element}
 */

export const PlayAdminBulk = ({
  form,
  onForm,
  selectedIds,
  playerCount,
  onClear,
}: PlayAdminBulkProps) => {
  const actions = usePlayAdminBoard()
  const [pending, setPending] = useState<{ mode: BulkMode; values: FormValues } | null>(null)
  const count = selectedIds.length

  const who =
    count > 0
      ? fillPlayMessage(COPY.whoMany, { count })
      : fillPlayMessage(COPY.whoEveryone, { count: playerCount })
  const target = pending
    ? pending.values.game === PLAY_ADMIN_TARGETS.global
      ? PLAY_MEMBER_COPY.global
      : PLAY_GAMES.label(String(pending.values.game) as Parameters<typeof PLAY_GAMES.label>[0])
    : ''

  // Confirmed gesture, then back to the list
  const confirm = async () => {
    if (!pending) return
    const send = pending.mode === 'give' ? actions.giveXp : actions.resetPlay
    if (await send(selectedIds, pending.values)) onClear()
    setPending(null)
  }

  return (
    <>
      {count > 0 && (
        <div className={PLAY_ADMIN.bulk}>
          <span className={PLAY_ADMIN.bulkCount}>{fillPlayMessage(COPY.selected, { count })}</span>
          <Button variant="arcade" onClick={() => onForm('give')}>
            {COPY.giveAction}
          </Button>
          <Button variant="arcade" onClick={() => onForm('reset')}>
            {COPY.resetAction}
          </Button>
          <Button variant="arcade" onClick={onClear}>
            {COPY.clearSelection}
          </Button>
        </div>
      )}

      <FormDrawer
        key={form ?? 'bulk-closed'}
        subject={FORM_SUBJECTS.playStats}
        open={form !== null}
        title={
          form === 'reset' ? COPY.resetAction : count > 0 ? COPY.giveAction : COPY.giveEveryone
        }
        fields={form === 'reset' ? PLAY_ADMIN_FIELDS.reset : PLAY_ADMIN_FIELDS.xp}
        initialValues={{ game: PLAY_ADMIN_TARGETS.global }}
        issues={actions.issues}
        isSaving={false}
        onSubmit={async (values) => {
          if (form) setPending({ mode: form, values })

          return true
        }}
        onClose={() => onForm(null)}
      />

      {pending && (
        <ConfirmDialog
          open
          title={fillPlayMessage(pending.mode === 'give' ? COPY.giveConfirm : COPY.resetConfirm, {
            amount: String(pending.values.amount ?? ''),
            who,
          })}
          description={fillPlayMessage(
            pending.mode === 'give' ? COPY.giveDescription : COPY.resetDescription,
            { target }
          )}
          pending={actions.isSaving}
          onCancel={() => setPending(null)}
          onConfirm={() => void confirm()}
        />
      )}
    </>
  )
}
