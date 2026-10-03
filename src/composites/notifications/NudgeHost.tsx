'use client'

import { useRouter } from 'next/navigation'

import { NudgeBubble } from '@/composites/notifications/NudgeBubble'
import { useBeaconSpot } from '@/core/hooks/interaction/useBeaconSpot'
import { useNotificationNudges } from '@/core/hooks/data/useNotificationNudges'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { NUDGE_SETTINGS } from '@/declarations/configurations/settings'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { notificationSentence } from '@/utils/format/notifications'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import { beaconOf } from '@/declarations/ui/beacons'
import { NUDGE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { NotificationEntry } from '@/types/notifications'

/**
 * Bubble sentence
 * @param {NotificationEntry} entry - Notification
 * @return {string | null} - Sentence or null
 */

const sentenceOf = (entry: NotificationEntry): string | null => {
  const kind = entry.kind ? NOTIFICATION_KIND_REGISTRY.get(entry.kind) : null
  if (!kind) return null

  const actor = entry.actorName ?? NOTIFICATION_COPY.system

  const { before, verb, after } = notificationSentence(kind, actor, entry.subject)

  return `${before}${verb}${after}`
}

/**
 * Live notification bubbles
 * @return {JSX.Element | null}
 */

export const NudgeHost = () => {
  const router = useRouter()
  const { queue, shift } = useNotificationNudges(true)
  const CloseIcon = ICONS.close

  const entry = queue[0] ?? null
  const target = entry?.target ? NOTIFICATION_TARGETS.get(entry.target) : null
  const href = target?.route(entry?.targetId ?? null) ?? null
  const label = entry ? sentenceOf(entry) : null
  const spot = useBeaconSpot(entry !== null, beaconOf(href))

  if (!entry || !label || !spot) return null

  return (
    <div
      className={NUDGE.anchor}
      style={{
        top: spot.top,
        left: spot.left,
        maxWidth: `calc(100vw - ${spot.left + NUDGE_SETTINGS.edgePx}px)`,
      }}
    >
      <NudgeBubble key={entry.id} onGone={shift}>
        {(fold) => (
          <>
            <button
              type="button"
              className={NUDGE.label}
              onClick={() => {
                fold()
                void apiPatch(API_ROUTES.notification(entry.id), {}).catch(() => undefined)
                if (href) router.push(href)
              }}
            >
              {label}
            </button>
            <button
              type="button"
              className={NUDGE.close}
              aria-label={NOTIFICATION_COPY.close}
              onClick={fold}
            >
              <CloseIcon className={NUDGE.closeIcon} aria-hidden="true" />
            </button>
          </>
        )}
      </NudgeBubble>
    </div>
  )
}
