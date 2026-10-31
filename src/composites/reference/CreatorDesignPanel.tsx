'use client'

import { useState } from 'react'

import { DesignCard } from '@/composites/reference/DesignCard'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPatch, apiPost, apiUpload } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  BannerSlots,
  DESIGN_BUCKETS,
  DESIGN_COPY,
  DesignKinds,
} from '@/declarations/reference/design'
import type { BannerSlotName, DesignKindName } from '@/declarations/reference/design'
import { CREATOR_FILE } from '@/declarations/ui/blocks'
import type { MenuItem } from '@/managers/front-end'
import type { CreatorDesign, DesignBanner } from '@/types/design'

export interface CreatorDesignPanelProps {
  youtuberId: string
  initial: CreatorDesign
  canManage: boolean
}

// Where a pick is going
interface Target {
  kind: DesignKindName
  bannerId?: string
}

/**
 * Gallery of a creator's pictures: banners, then avatar, then logo
 * @param {string} youtuberId - Creator identifier
 * @param {CreatorDesign} initial - Pictures resolved server-side
 * @param {boolean} canManage - Viewer may change them
 * @return {JSX.Element}
 */

export const CreatorDesignPanel = ({ youtuberId, initial, canManage }: CreatorDesignPanelProps) => {
  const { isSaving, run } = useMutation()
  const [design, setDesign] = useState(initial)

  const send = async ({ kind, bannerId }: Target, file: File) => {
    const next = await run(async () => {
      const form = new FormData()
      form.set('file', file)
      form.set('bucket', DESIGN_BUCKETS[kind])
      const stored = await apiUpload<{ url: string }>(API_ROUTES.files, form)

      return apiPost<CreatorDesign>(API_ROUTES.creatorDesign(youtuberId), {
        kind,
        url: stored.url,
        id: bannerId,
      })
    }, DESIGN_COPY.saved)
    if (next) setDesign(next)
  }

  const remove = async ({ kind, bannerId }: Target) => {
    const next = await run(
      () => apiDelete<CreatorDesign>(API_ROUTES.creatorDesign(youtuberId), { kind, id: bannerId }),
      DESIGN_COPY.removed
    )
    if (next) setDesign(next)
  }

  const assign = async (banner: DesignBanner, slot: BannerSlotName | null) => {
    const next = await run(
      () => apiPatch<CreatorDesign>(API_ROUTES.creatorDesign(youtuberId), { id: banner.id, slot }),
      DESIGN_COPY.assigned
    )
    if (next) setDesign(next)
  }

  // Placement entries of a banner
  const slotItems = (banner: DesignBanner): MenuItem[] => [
    ...Object.values(BannerSlots)
      .filter((slot) => slot !== banner.slot)
      .map((slot) => ({
        id: slot,
        label: DESIGN_COPY.assignTo(DESIGN_COPY.slots[slot]),
        onSelect: () => void assign(banner, slot),
      })),
    ...(banner.slot
      ? [{ id: 'unassign', label: DESIGN_COPY.unassign, onSelect: () => void assign(banner, null) }]
      : []),
  ]

  const card = (next: Target, url: string | null, banner?: DesignBanner) => (
    <DesignCard
      key={next.bannerId ?? next.kind}
      kind={next.kind}
      url={url}
      disabled={!canManage || isSaving}
      canRemove={canManage}
      caption={
        banner &&
        (banner.slot ? DESIGN_COPY.assignedTo(DESIGN_COPY.slots[banner.slot]) : DESIGN_COPY.unused)
      }
      slotItems={banner && slotItems(banner)}
      onFile={(file) => void send(next, file)}
      onRemove={() => void remove(next)}
    />
  )

  const cell = (title: string, children: React.ReactNode) => (
    <div className={CREATOR_FILE.designCell}>
      <h3 className={CREATOR_FILE.designTitle}>{title}</h3>
      {children}
    </div>
  )

  return (
    <div className={CREATOR_FILE.designStack}>
      <div className={CREATOR_FILE.designTop}>
        {cell(DESIGN_COPY.avatarTitle, card({ kind: DesignKinds.Avatar }, design.avatarUrl))}
        {cell(DESIGN_COPY.logoTitle, card({ kind: DesignKinds.Logo }, design.logoUrl))}
      </div>
      <div className={CREATOR_FILE.designGallery}>
        <h3 className={CREATOR_FILE.designTitle}>{DESIGN_COPY.bannersTitle}</h3>
        <div className={CREATOR_FILE.bannerGrid}>
          {design.banners.map((banner) =>
            card({ kind: DesignKinds.Banner, bannerId: banner.id }, banner.url, banner)
          )}
          {canManage && card({ kind: DesignKinds.Banner }, null)}
        </div>
      </div>
    </div>
  )
}
