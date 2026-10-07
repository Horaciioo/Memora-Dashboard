/**
 * Topics of the notification push
 * @type {{ fresh: string }}
 */

export const NOTIFICATION_TOPICS = {
  // One notification just written for one member
  fresh: 'notifications:fresh',
} as const

/**
 * Event names written on the notification stream
 * @type {{ fresh: string }}
 */

export const NOTIFICATION_STREAM_EVENTS = {
  fresh: 'notification',
} as const
