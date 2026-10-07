import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { RELEASE_STAGES } from '../../src/utils/format/version.ts'
import type { ReleaseStage } from '../../src/utils/format/version.ts'

export { compareVersions, parseVersion } from '../../src/utils/format/version.ts'

// Repository root
export const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

// Release views
const PACKAGE_FILE = join(ROOT, 'package.json')
const CHANGELOG_FILE = join(ROOT, 'CHANGELOG.md')
const SETTINGS_FILE = join(ROOT, 'src/configurations/system/versioning.json')

// Unreleased section
const UNRELEASED_HEADING = '## [Non publié]'

/**
 * Versioning settings
 * @typedef {Object} VersioningSettings
 * @property {string} workBranch - Only writable branch
 * @property {string} snapshotBranch - Testers branch
 * @property {string[]} promotionFlow - Promotion order
 * @property {Record<string, string>} stages - Stage per branch
 * @property {string | null} notesFile - User notes
 */

interface VersioningSettings {
  workBranch: string
  snapshotBranch: string
  promotionFlow: string[]
  stages: Record<string, string>
  notesFile: string | null
}

// Declared once
export const SETTINGS = JSON.parse(readFileSync(SETTINGS_FILE, 'utf8')) as VersioningSettings

/**
 * package.json version
 * @return {string} - Written version
 */

export const packageVersion = (): string =>
  (JSON.parse(readFileSync(PACKAGE_FILE, 'utf8')) as { version: string }).version

/**
 * Write package.json version
 * @param {string} version - New version
 * @return {void}
 */

export const writePackageVersion = (version: string): void => {
  const text = readFileSync(PACKAGE_FILE, 'utf8')
  writeFileSync(PACKAGE_FILE, text.replace(/("version":\s*")[^"]+(")/, `$1${version}$2`))
}

/**
 * Release note versions
 * @return {string[]} - Newest first
 */

export const noteVersions = (): string[] =>
  SETTINGS.notesFile
    ? [
        ...readFileSync(join(ROOT, SETTINGS.notesFile), 'utf8').matchAll(
          /^\s{4}version:\s*'([^']+)'/gm
        ),
      ].map((match) => match[1] ?? '')
    : []

/**
 * Technical changelog present
 * @return {boolean}
 */

export const hasChangelog = (): boolean => existsSync(CHANGELOG_FILE)

/**
 * Changelog version section
 * @param {string} version - Looked up version
 * @return {boolean}
 */

export const changelogHasVersion = (version: string): boolean =>
  readFileSync(CHANGELOG_FILE, 'utf8').includes(`## [${version}]`)

/**
 * Close unreleased section
 * @param {string} version - Released version
 * @param {string} date - YYYY-MM-DD
 * @return {void}
 */

export const closeUnreleased = (version: string, date: string): void => {
  const text = readFileSync(CHANGELOG_FILE, 'utf8')
  if (!text.includes(UNRELEASED_HEADING)) {
    throw new Error(`${UNRELEASED_HEADING} manque dans CHANGELOG.md`)
  }

  writeFileSync(
    CHANGELOG_FILE,
    text.replace(UNRELEASED_HEADING, `${UNRELEASED_HEADING}\n\n## [${version}] - ${date}`)
  )
}

/**
 * Stage of a branch
 * @param {string} branch - Deployed branch
 * @return {ReleaseStage} - Declared stage
 */

export const stageOfBranch = (branch: string): ReleaseStage => {
  const declared = SETTINGS.stages[branch]
  if (RELEASE_STAGES.includes(declared as ReleaseStage)) return declared as ReleaseStage

  // Undeclared production build
  return !branch && process.env.NODE_ENV === 'production' ? 'release' : 'snapshot'
}

/**
 * Run git
 * @param {string[]} args - Git arguments
 * @return {string} - Trimmed output
 */

export const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()

/**
 * Run GitHub CLI
 * @param {string[]} args - gh arguments
 * @return {string} - Trimmed output
 */

export const gh = (...args: string[]): string =>
  execFileSync('gh', args, { cwd: ROOT, encoding: 'utf8' }).trim()

/**
 * Run package script
 * @param {string} script - Script name
 * @return {void}
 */

export const yarnRun = (script: string): void => {
  execFileSync('yarn', [script], { cwd: ROOT, stdio: 'inherit' })
}

/**
 * Stop with message
 * @param {string} message - Stop reason
 * @return {never}
 */

export const fail = (message: string): never => {
  console.error(`✖ ${message}`)
  process.exit(1)
}

/**
 * Read CLI flag
 * @param {string} name - Flag name
 * @return {string | boolean | undefined} - Value or presence
 */

export const flag = (name: string): string | boolean | undefined => {
  const args = process.argv.slice(2)
  const index = args.indexOf(`--${name}`)
  if (index === -1) return undefined

  const next = args[index + 1]

  return next && !next.startsWith('--') ? next : true
}

/**
 * Require clean work branch
 * @param {string[]} [allowed] - Writable files
 * @return {void}
 */

export const assertCleanWorkBranch = (allowed: string[] = []): void => {
  const { workBranch } = SETTINGS
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
  if (branch !== workBranch) fail(`à lancer sur ${workBranch}, tu es sur ${branch}`)

  // Only script files dirty
  const dirty = git('status', '--porcelain', '--untracked-files=no')
    .split('\n')
    // The helper trims the first line
    .map((line) => line.replace(/^\s*[A-Z?]{1,2}\s+/, '').trim())
    .filter((file) => file && !allowed.includes(file))
  if (dirty.length > 0) fail(`des fichiers ne sont pas commités : ${dirty.join(', ')}`)

  // Level with origin
  git('fetch', '--quiet', 'origin', workBranch)
  const behind = Number(git('rev-list', '--count', `HEAD..origin/${workBranch}`))
  if (behind > 0) fail(`${workBranch} a ${behind} commit(s) de retard sur origin, fais un pull`)
}

/**
 * Latest version tag
 * @param {string} [ref] - Commit or branch
 * @return {string | null} - Tag or null
 */

export const latestTag = (ref = 'HEAD'): string | null => {
  try {
    return git('describe', '--tags', '--abbrev=0', '--match', 'v*', ref)
  } catch {
    return null
  }
}

/**
 * Commit subjects
 * @param {string} range - Git range
 * @return {string[]} - Oldest first
 */

export const commitSubjects = (range: string): string[] =>
  git('log', '--reverse', '--no-merges', '--format=%s', range).split('\n').filter(Boolean)

// Technical emojis stay out
const PR_SECTIONS: { heading: string; emojis: string[] }[] = [
  { heading: 'Added', emojis: ['✨', '🍱', '🎉', '🌐'] },
  { heading: 'Changed', emojis: ['💄', '🚸', '📱', '💫', '♿️', '⚡️', '💬', '🔗', '⏰'] },
  { heading: 'Removed', emojis: ['🔥', '➖', '⚰️'] },
  { heading: 'Fixed', emojis: ['🐛', '🩹', '🚑️', '🔒️'] },
]

// Title emoji per section
const PR_TITLE_EMOJIS: Record<string, string> = {
  Added: '✨',
  Changed: '💄',
  Removed: '🔥',
  Fixed: '🐛',
}

/**
 * PR changelog from commits
 * @param {string[]} subjects - Commit subjects
 * @return {{ body: string, emoji: string }} - Body and emoji
 */

export const pullRequestChangelog = (subjects: string[]): { body: string; emoji: string } => {
  const sections = PR_SECTIONS.map((section) => ({
    heading: section.heading,
    lines: subjects
      .filter((subject) => section.emojis.some((emoji) => subject.startsWith(emoji)))
      .map((subject) => subject.replace(/^\S+\s+/, '')),
  })).filter((section) => section.lines.length > 0)

  const dominant = [...sections].sort((left, right) => right.lines.length - left.lines.length)[0]

  return {
    body: sections
      .map((section) => {
        const lines = section.lines.map((line) => `- ${line}`).join('\n')

        return `## ${section.heading}\n\n${lines}`
      })
      .join('\n\n'),
    emoji: PR_TITLE_EMOJIS[dominant?.heading ?? 'Changed'] ?? '💄',
  }
}

/**
 * Open or update PR
 * @param {Object} input - PR content
 * @param {string} input.base - Target branch
 * @param {string} input.head - Source branch
 * @param {string} input.title - Title
 * @param {string} input.body - Markdown body
 * @return {string} - PR address
 */

export const openPullRequest = (input: {
  base: string
  head: string
  title: string
  body: string
}): string => {
  const open = gh(
    'pr',
    'list',
    '--base',
    input.base,
    '--head',
    input.head,
    '--state',
    'open',
    '--json',
    'url',
    '--jq',
    '.[0].url'
  )

  if (open) {
    gh('pr', 'edit', open, '--title', input.title, '--body', input.body)
    return open
  }

  return gh(
    'pr',
    'create',
    '--base',
    input.base,
    '--head',
    input.head,
    '--title',
    input.title,
    '--body',
    input.body
  )
}
