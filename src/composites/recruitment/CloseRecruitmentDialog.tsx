'use client'

import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { useCloseRecruitment } from '@/core/hooks/data/recruitment/useCloseRecruitment'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import type { RecruitmentSummary } from '@/types/recruitment'

export interface CloseRecruitmentDialogProps {
  // Session being closed, null keeps it shut
  sessionId: string | null
  onClose: () => void
  onClosed: (summary: RecruitmentSummary) => void
}

/**
 * Guard before closing a session
 * @param {CloseRecruitmentDialogProps} props - Session and callbacks
 * @return {JSX.Element}
 */

export const CloseRecruitmentDialog = ({
  sessionId,
  onClose,
  onClosed,
}: CloseRecruitmentDialogProps) => {
  const { isSaving, close } = useCloseRecruitment()

  return (
    <ConfirmDialog
      open={sessionId !== null}
      tone="brand"
      title={RECRUITMENT_COPY.closeTitle}
      description={RECRUITMENT_COPY.closeDescription}
      confirmLabel={RECRUITMENT_COPY.closeConfirm}
      cancelLabel={RECRUITMENT_COPY.closeCancel}
      pending={isSaving}
      onCancel={onClose}
      onConfirm={async () => {
        const summary = await close(sessionId!)
        if (summary) onClosed(summary)
        onClose()
      }}
    />
  )
}
