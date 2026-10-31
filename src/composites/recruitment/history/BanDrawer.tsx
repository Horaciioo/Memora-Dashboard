'use client'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { useBlacklist } from '@/core/hooks/data/recruitment/useBlacklist'
import { BAN_DRAWER_FIELDS } from '@/declarations/recruitment/banForm'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'

/**
 * Identifier about to be barred
 * @typedef {Object} BanTarget
 * @property {string} discordId - Identifier
 * @property {string | null} sessionId - Session the decision is taken on
 * @property {string} [candidateId] - Candidacy it comes from
 */

export interface BanTarget {
  discordId: string
  sessionId: string | null
  candidateId?: string
}

export interface BanDrawerProps {
  // Barring, or freeing when the identifier is already barred
  target: BanTarget | null
  isBanned: boolean
  onClose: () => void
}

/**
 * Drawer asking why, or dialog confirming the release
 * @param {BanDrawerProps} props - Identifier and close handler
 * @return {JSX.Element}
 */

export const BanDrawer = ({ target, isBanned, onClose }: BanDrawerProps) => {
  const { isSaving, issues, ban, lift } = useBlacklist()

  return (
    <>
      <FormDrawer
        subject={FORM_SUBJECTS.ban}
        open={target !== null && !isBanned}
        title={HISTORY_COPY.banTitle}
        submitVerb={HISTORY_COPY.submitBan}
        note={HISTORY_COPY.banNote}
        fields={BAN_DRAWER_FIELDS}
        issues={issues}
        isSaving={isSaving}
        onSubmit={async (values) => {
          const done = await ban(target!, values)
          if (done) onClose()

          return done
        }}
        onClose={onClose}
      />

      <ConfirmDialog
        open={target !== null && isBanned}
        tone="brand"
        title={HISTORY_COPY.unbanTitle}
        description={HISTORY_COPY.unbanDescription}
        confirmLabel={HISTORY_COPY.unban}
        pending={isSaving}
        onCancel={onClose}
        onConfirm={async () => {
          if (await lift(target!.discordId)) onClose()
        }}
      />
    </>
  )
}
