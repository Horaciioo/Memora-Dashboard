// Game page of the Play room
const SESSION_PATH = /^\/play\/sessions\/([^/?#]+)/

/**
 * Game a Play page shows
 * @param {string | null} pathname - Current path
 * @return {string | null} - Game id, null elsewhere
 */

export const matchPlaySessionPath = (pathname: string | null): string | null =>
  SESSION_PATH.exec(pathname ?? '')?.[1] ?? null
