'use client'

import { useBanDetail } from '@/core/hooks/data/lives/useBanDetail'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { MODVIEW_USER } from '@/declarations/ui/variants'

export interface ViewerBanBoxProps {
  liveId: string | null
  chatterId: string
}

/**
 * Notice shown while the viewer is banned from the stream
 * @param {string | null} liveId - Live, none off a real live
 * @param {string} chatterId - Viewer
 * @return {JSX.Element | null}
 */

export const ViewerBanBox = ({ liveId, chatterId }: ViewerBanBoxProps) => {
  const { detail } = useBanDetail(liveId, chatterId)
  if (!detail || !detail.bannedAt) return null

  return (
    <p className={MODVIEW_USER.banBox} role="status">
      {detail.reason
        ? MODVIEW_USER_COPY.bannedWith.replace('{reason}', detail.reason)
        : MODVIEW_USER_COPY.bannedPlain}
    </p>
  )
}
