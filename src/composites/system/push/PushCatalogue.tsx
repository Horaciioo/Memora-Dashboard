'use client'

import Image from 'next/image'

import { Button } from '@/components/elements/actions/Button'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PUSH_CATEGORY_REGISTRY } from '@/declarations/notifications/categories'
import { PUSH_CONSOLE_COPY } from '@/declarations/pwa/copy'
import { PWA_ICON_SIZES } from '@/declarations/pwa/manifest'
import { PREFERENCE_STYLES, PUSH_STYLES } from '@/declarations/ui/variants'
import type { PushCatalogueEntry } from '@/types/push'

export interface PushCatalogueProps {
  entries: PushCatalogueEntry[]
  hasDevice: boolean
}

/**
 * Every push as a phone shows it, each one sendable to the admin
 * @param {PushCatalogueEntry[]} entries - Catalogue
 * @param {boolean} hasDevice - The admin has a subscribed device
 * @return {JSX.Element}
 */

export const PushCatalogue = ({ entries, hasDevice }: PushCatalogueProps) => {
  const { isSaving, run } = useMutation()

  return (
    <div className={PREFERENCE_STYLES.rows}>
      {!hasDevice && <p className={PUSH_STYLES.journalMuted}>{PUSH_CONSOLE_COPY.noDevice}</p>}
      {entries.map(({ kind, category, payload }) => (
        <div key={kind} className={PUSH_STYLES.catalogueRow}>
          <div className={PUSH_STYLES.preview}>
            <Image
              src={payload.icon}
              alt=""
              width={PWA_ICON_SIZES.small}
              height={PWA_ICON_SIZES.small}
              className={PUSH_STYLES.previewIcon}
            />
            <div className={PUSH_STYLES.previewText}>
              <span className={PUSH_STYLES.previewMeta}>
                {PUSH_CATEGORY_REGISTRY.label(category)}
              </span>
              <span className={PUSH_STYLES.previewTitle}>{payload.title}</span>
              <span className={PUSH_STYLES.previewBody}>{payload.body}</span>
            </div>
          </div>
          <Button
            variant="secondary"
            icon="bell"
            disabled={!hasDevice || isSaving}
            onClick={() =>
              void run(() => apiPost(API_ROUTES.pushSample(kind), {}), PUSH_CONSOLE_COPY.sent)
            }
          >
            {PUSH_CONSOLE_COPY.sendToMe}
          </Button>
        </div>
      ))}
    </div>
  )
}
