import Link from '@/components/elements/navigation/AppLink'

import { Avatar } from '@/components/elements/display/Avatar'
import { NOTIFICATION_COPY } from '@/declarations/notifications/copy'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { NOTIFICATION_TARGETS } from '@/declarations/notifications/targets'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { NOTIFICATION_STYLES } from '@/declarations/ui/variants'
import { formatSince } from '@/utils/format/dates'
import { notificationSentence } from '@/utils/format/notifications'
import { cn } from '@/utils/classnames'
import type { NotificationEntry } from '@/types/notifications'

export interface NotificationItemProps {
  entry: NotificationEntry
  withAction: boolean
  onOpen: (id: string) => void
  // Dismisses the row for good
  onRemove?: (id: string) => void
  // Turns an opened row back to unread
  onMarkUnread?: (id: string) => void
}

/**
 * One notification
 * @param {NotificationEntry} entry - Notification to draw
 * @param {boolean} withAction - Carries the way in
 * @param {(id: string) => void} onOpen - Called once the row is settled
 * @param {(id: string) => void} [onRemove] - Dismisses the row
 * @param {(id: string) => void} [onMarkUnread] - Turns an opened row back to unread
 * @return {JSX.Element}
 */

export const NotificationItem = ({
  entry,
  withAction,
  onOpen,
  onRemove,
  onMarkUnread,
}: NotificationItemProps) => {
  const kind = entry.kind ? NOTIFICATION_KIND_REGISTRY.get(entry.kind) : null
  const target = entry.target ? NOTIFICATION_TARGETS.get(entry.target) : null
  const href = target?.route(entry.targetId) ?? null
  const actor = entry.actorName ?? NOTIFICATION_COPY.system
  const sentence = kind ? notificationSentence(kind, actor, entry.subject) : null
  const tone = TONES[kind?.tone ?? 'neutral']
  const Glyph = ICONS[kind?.icon ?? 'bell']
  const ActionIcon = ICONS.forward
  const RemoveIcon = ICONS.close

  return (
    <div
      className={cn(
        NOTIFICATION_STYLES.row,
        !entry.isRead && NOTIFICATION_STYLES.rowUnread,
        withAction && href && NOTIFICATION_STYLES.rowLinked,
        'group/row relative'
      )}
    >
      <span className={NOTIFICATION_STYLES.portrait}>
        <Avatar name={actor} src={entry.actorAvatar} size="sm" />
        <span className={cn(NOTIFICATION_STYLES.glyph, tone.soft, tone.text)}>
          <Glyph className={NOTIFICATION_STYLES.glyphIcon} aria-hidden="true" />
        </span>
      </span>

      <div className={NOTIFICATION_STYLES.content}>
        {sentence && (
          <p className={NOTIFICATION_STYLES.sentence}>
            {sentence.before}
            <strong className={NOTIFICATION_STYLES.verb}>{sentence.verb}</strong>
            {sentence.after}
          </p>
        )}
        {entry.subject && !kind?.addressed && (
          <p className={NOTIFICATION_STYLES.subject}>{entry.subject}</p>
        )}

        <div className={NOTIFICATION_STYLES.foot}>
          <span className={NOTIFICATION_STYLES.moment} suppressHydrationWarning>
            {formatSince(entry.createdAt)}
          </span>
          {onMarkUnread && entry.isRead && (
            <button
              type="button"
              className={NOTIFICATION_STYLES.markUnread}
              onClick={() => onMarkUnread(entry.id)}
            >
              {NOTIFICATION_COPY.markUnread}
            </button>
          )}
        </div>
      </div>
      {withAction && href && (
        <>
          <Link
            href={href}
            onClick={() => onOpen(entry.id)}
            aria-label={NOTIFICATION_COPY.goTo.replace('{target}', target?.label ?? '')}
            className={NOTIFICATION_STYLES.rowLink}
          />
          <ActionIcon className={NOTIFICATION_STYLES.rowArrow} aria-hidden="true" />
        </>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={NOTIFICATION_COPY.remove}
          title={NOTIFICATION_COPY.remove}
          className={NOTIFICATION_STYLES.remove}
          onClick={() => onRemove(entry.id)}
        >
          <RemoveIcon className={NOTIFICATION_STYLES.removeIcon} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
