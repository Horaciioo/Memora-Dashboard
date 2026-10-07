import type { NotificationEntry, NotificationFeed } from '@/types/notifications'

/**
 * Put a notification at the head of the feed, once
 * @param {NotificationFeed} feed - Feed held
 * @param {NotificationEntry} entry - Notification received
 * @return {NotificationFeed} - Feed with the entry first and the badge raised if unread
 */

export const receiveEntry = (
  feed: NotificationFeed,
  entry: NotificationEntry
): NotificationFeed => {
  if (feed.entries.some((row) => row.id === entry.id)) return feed

  return {
    ...feed,
    entries: [entry, ...feed.entries],
    unread: feed.unread + (entry.isRead ? 0 : 1),
  }
}

/**
 * Settle one notification
 * @param {NotificationFeed} feed - Feed held
 * @param {string} id - Notification opened
 * @return {NotificationFeed} - Feed with the entry read
 */

export const settleEntry = (feed: NotificationFeed, id: string): NotificationFeed => {
  const entry = feed.entries.find((row) => row.id === id)
  if (!entry || entry.isRead) return feed

  return {
    ...feed,
    entries: feed.entries.map((row) => (row.id === id ? { ...row, isRead: true } : row)),
    unread: Math.max(0, feed.unread - 1),
  }
}

/**
 * Settle every notification
 * @param {NotificationFeed} feed - Feed held
 * @return {NotificationFeed} - Feed with nothing left unread
 */

export const settleAll = (feed: NotificationFeed): NotificationFeed => ({
  ...feed,
  entries: feed.entries.map((row) => ({ ...row, isRead: true })),
  unread: 0,
})

/**
 * Drop one notification
 * @param {NotificationFeed} feed - Feed held
 * @param {string} id - Notification removed
 * @return {NotificationFeed} - Feed without it, badge lowered if it was unread
 */

export const dropEntry = (feed: NotificationFeed, id: string): NotificationFeed => {
  const entry = feed.entries.find((row) => row.id === id)
  if (!entry) return feed

  return {
    ...feed,
    entries: feed.entries.filter((row) => row.id !== id),
    unread: Math.max(0, feed.unread - (entry.isRead ? 0 : 1)),
  }
}

/**
 * Drop every notification already read
 * @param {NotificationFeed} feed - Feed held
 * @return {NotificationFeed} - Feed with the unread ones only
 */

export const dropRead = (feed: NotificationFeed): NotificationFeed => ({
  ...feed,
  entries: feed.entries.filter((row) => !row.isRead),
})

/**
 * Add an older page behind the feed
 * @param {NotificationFeed} feed - Feed held
 * @param {NotificationFeed} page - Older page just read
 * @return {NotificationFeed} - Feed extended, entries never doubled
 */

export const appendPage = (feed: NotificationFeed, page: NotificationFeed): NotificationFeed => {
  const held = new Set(feed.entries.map((row) => row.id))

  return {
    entries: [...feed.entries, ...page.entries.filter((row) => !held.has(row.id))],
    unread: page.unread,
    hasMore: page.hasMore,
  }
}

/**
 * Fold a fresh first page into the feed without losing the older entries already loaded
 * @param {NotificationFeed} feed - Feed held
 * @param {NotificationFeed} page - First page just read
 * @return {NotificationFeed} - Newest page on top, older held entries behind it
 */

export const refreshFeed = (feed: NotificationFeed, page: NotificationFeed): NotificationFeed => {
  const fresh = new Set(page.entries.map((row) => row.id))
  const oldest = page.entries.at(-1)?.createdAt ?? ''
  // Held entries older than the page stay, newer ones missing from it were removed meanwhile
  const kept = feed.entries.filter((row) => !fresh.has(row.id) && row.createdAt < oldest)

  return {
    entries: [...page.entries, ...kept],
    unread: page.unread,
    hasMore: kept.length > 0 ? feed.hasMore : page.hasMore,
  }
}
