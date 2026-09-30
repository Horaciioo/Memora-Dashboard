import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { baseVersion, parseVersion } from '@/utils/format/version'
import type { ReleaseStage } from '@/utils/format/version'

/**
 * Application name
 * @type {string}
 */

export const APP_NAME = 'Memora'

/**
 * Publishing company
 * @type {string}
 */

export const APP_COMPANY = 'Marsha'

/**
 * Application description
 * @type {string}
 */

export const APP_DESCRIPTION =
  'Le dashboard de Marsha : équipes, projets, tâches, réunions et modération au même endroit.'

/**
 * Brand assets
 * @type {Record<string, string>}
 */

export const APP_ASSETS = {
  wordmark: '/marsha-logo.png',
  loader: '/Loader.gif',
} as const

/**
 * Web font delivery, the families themselves named in src/styles/fonts.css
 * @type {{ preconnect: string[], stylesheet: string }}
 */

export const APP_FONTS = {
  preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  stylesheet:
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Inter:wght@400..900&family=JetBrains+Mono:wght@400;500&display=swap',
} as const

/**
 * Shown version, set at build
 * @type {string}
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0'

// Parsed shown version
const VERSION_PARTS = parseVersion(APP_VERSION)

// Stage words
const STAGE_WORDS: Record<Exclude<ReleaseStage, 'release'>, string> = {
  snapshot: CHANGELOG_COPY.stageSnapshot,
  candidate: CHANGELOG_COPY.stageCandidate,
}

/**
 * Version label, e.g. v0.2.0 Snapshot 3
 * @type {string}
 */

export const APP_VERSION_LABEL = !VERSION_PARTS
  ? `v${APP_VERSION}`
  : VERSION_PARTS.stage === 'release'
    ? `v${baseVersion(VERSION_PARTS)}`
    : `v${baseVersion(VERSION_PARTS)} ${STAGE_WORDS[VERSION_PARTS.stage]} ${VERSION_PARTS.build}`
