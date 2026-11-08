import { APP_VERSION } from '@/declarations/app'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { ROUTES } from '@/declarations/navigation'
import { baseVersion, parseVersion } from '@/utils/format/version'

/**
 * What a member marks as read: the shown version while its note is being built, so each
 * snapshot announces itself again
 * @param {ChangelogRelease} release - Note
 * @return {string} - Read key
 */

export const releaseSeenKey = (release: ChangelogRelease): string => {
  const shown = parseVersion(APP_VERSION)

  return shown && baseVersion(shown) === release.version ? APP_VERSION : release.version
}

/**
 * Tell if a read mark already covers the version of a note, whatever its snapshot
 * @param {string | null} seen - Stored read mark
 * @param {ChangelogRelease} release - Note
 * @return {boolean} - Version already met
 */

export const isVersionSeen = (seen: string | null, release: ChangelogRelease): boolean => {
  const parts = seen ? parseVersion(seen) : null

  return parts !== null && baseVersion(parts) === release.version
}

/**
 * Address of one note
 * @param {string} version - Note version
 * @return {string} - Page address
 */

export const changelogPath = (version: string): string =>
  `${ROUTES.changelog}?version=${encodeURIComponent(version)}`
