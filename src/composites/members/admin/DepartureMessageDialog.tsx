'use client'

import { Button } from '@/components/elements/actions/Button'
import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

export interface DepartureMessageDialogProps {
  open: boolean
  body: string
  onClose: () => void
}

/**
 * Departure message drawn as Discord shows it, with a button to copy it
 * @param {boolean} open - Overlay is mounted
 * @param {string} body - Discord markdown
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const DepartureMessageDialog = ({ open, body, onClose }: DepartureMessageDialogProps) => {
  const { session } = useAuthContext()
  const copy = useCopy(MEMBER_ADMIN_COPY.messageCopied)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={MEMBER_ADMIN_COPY.messageTitle}
      description={MEMBER_ADMIN_COPY.messageLead}
      size="md"
      footer={
        <>
          <Button onClick={onClose}>{ACTION_COPY.close}</Button>
          <Button variant="primary" icon="copy" onClick={() => void copy(body)}>
            {MEMBER_ADMIN_COPY.messageCopy}
          </Button>
        </>
      }
    >
      <div className={DISCORD_MESSAGE.frame}>
        <DiscordMessage
          source={body}
          mentions={[]}
          author={session?.displayName ?? MEMBER_ADMIN_COPY.messageAuthor}
          avatarUrl={session?.avatarUrl}
        />
      </div>
    </Dialog>
  )
}
