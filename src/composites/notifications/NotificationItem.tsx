import Link from 'next/link'

import { Avatar } from '@/components/elements/display/Avatar'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import { formatSince } from '@/utils/format/dates'
import { cn } from '@/utils/classnames'
import type { NotificationEntry } from '@/types/notifications'

export interface NotificationItemProps {
  entry: NotificationEntry
  withAction: boolean
  onOpen: (id: string) => void
}

/**
 * One notification, the portrait of whoever acted opening the sentence and the verb alone
 * carrying the emphasis — the way in only appears on the freshest few
 * @param {NotificationEntry} entry - Notification to draw
 * @param {boolean} withAction - Carries the way in
 * @param {(id: string) => void} onOpen - Called once the row is settled
 * @return {JSX.Element}
 */

export const NotificationItem = ({ entry, withAction, onOpen }: NotificationItemProps) => {
  const kind = entry.kind ? NOTIFICATION_KIND_REGISTRY.get(entry.kind) : null
  const target = entry.target ? NOTIFICATION_TARGETS.get(entry.target) : null
  const href = target?.route(entry.targetId) ?? null
  const actor = entry.actorName ?? NOTIFICATION_COPY.system
  const tone = TONES[kind?.tone ?? 'neutral']
  const Glyph = ICONS[kind?.icon ?? 'bell']
  const ActionIcon = ICONS.forward

  return (
    <div className={cn(NOTIFICATION_STYLES.row, !entry.isRead && NOTIFICATION_STYLES.rowUnread)}>
      <span className={NOTIFICATION_STYLES.portrait}>
        <Avatar name={actor} src={entry.actorAvatar} size="sm" />
        <span className={cn(NOTIFICATION_STYLES.glyph, tone.soft, tone.text)}>
          <Glyph className={NOTIFICATION_STYLES.glyphIcon} aria-hidden="true" />
        </span>
      </span>

      <div className={NOTIFICATION_STYLES.content}>
        {kind && (
          <p className={NOTIFICATION_STYLES.sentence}>
            {`${actor} ${kind.lead} `}
            <strong className={NOTIFICATION_STYLES.verb}>{kind.verb}</strong>
            {kind.trail ? ` ${kind.trail}.` : '.'}
          </p>
        )}
        {entry.subject && <p className={NOTIFICATION_STYLES.subject}>{entry.subject}</p>}

        <div className={NOTIFICATION_STYLES.foot}>
          <span className={NOTIFICATION_STYLES.moment} suppressHydrationWarning>
            {formatSince(entry.createdAt)}
          </span>
          {withAction && href && (
            <Link
              href={href}
              onClick={() => onOpen(entry.id)}
              aria-label={NOTIFICATION_COPY.goTo.replace('{target}', target?.label ?? '')}
              className={NOTIFICATION_STYLES.action}
            >
              {NOTIFICATION_COPY.action}
              <ActionIcon className={NOTIFICATION_STYLES.actionIcon} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
