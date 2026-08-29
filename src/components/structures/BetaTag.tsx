'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { WIP_COPY } from '@/declarations/ui/copy'
import { BETA_STYLES } from '@/declarations/ui/variants'

/**
 * Amber pill flagging an unfinished feature, its click opening a plain explainer
 * @return {JSX.Element}
 */

export const BetaTag = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={BETA_STYLES.tag} onClick={() => setOpen(true)}>
        {WIP_COPY.badge}
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={WIP_COPY.betaDialogTitle}
        size="xs"
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            {WIP_COPY.betaAck}
          </Button>
        }
      >
        <p className="text-sm text-[var(--color-ink-subtle)]">{WIP_COPY.betaDialogBody}</p>
      </Dialog>
    </>
  )
}
