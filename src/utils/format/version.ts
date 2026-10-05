// Build stages
export const RELEASE_STAGES = ['snapshot', 'candidate', 'release'] as const

/**
 * Stage of a build
 * @type {(typeof RELEASE_STAGES)[number]}
 */

export type ReleaseStage = (typeof RELEASE_STAGES)[number]

/**
 * Version parts
 * @typedef {Object} VersionParts
 * @property {number} major - Breaking changes
 * @property {number} minor - Features
 * @property {number} patch - Fixes
 * @property {ReleaseStage} stage - Build stage
 * @property {number | null} build - Stage counter
 */

export interface VersionParts {
  major: number
  minor: number
  patch: number
  stage: ReleaseStage
  build: number | null
}

// SemVer suffixes
const STAGE_SUFFIX: Record<Exclude<ReleaseStage, 'release'>, string> = {
  snapshot: 'snapshot',
  candidate: 'rc',
}

// X.Y.Z[-snapshot.N|-rc.N]
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-(snapshot|rc)\.(\d+))?$/

/**
 * Split a version
 * @param {string} version - Written version
 * @return {VersionParts | null} - Parts or null
 */

export const parseVersion = (version: string): VersionParts | null => {
  const match = VERSION_PATTERN.exec(version)
  if (!match) return null

  const suffix = match[4]

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    stage: suffix === 'snapshot' ? 'snapshot' : suffix === 'rc' ? 'candidate' : 'release',
    build: match[5] === undefined ? null : Number(match[5]),
  }
}

/**
 * Release number
 * @param {VersionParts} parts - Parsed version
 * @return {string} - X.Y.Z
 */

export const baseVersion = (parts: VersionParts): string =>
  `${parts.major}.${parts.minor}.${parts.patch}`

/**
 * Join version parts
 * @param {VersionParts} parts - Parsed version
 * @return {string} - Written version
 */

export const formatVersion = (parts: VersionParts): string =>
  parts.stage === 'release' || parts.build === null
    ? baseVersion(parts)
    : `${baseVersion(parts)}-${STAGE_SUFFIX[parts.stage]}.${parts.build}`

/**
 * Order two versions
 * @param {string} left - First version
 * @param {string} right - Second version
 * @return {number} - Negative when earlier
 */

export const compareVersions = (left: string, right: string): number => {
  const first = parseVersion(left)
  const second = parseVersion(right)
  if (!first || !second) return 0

  const stageRank = (parts: VersionParts) => RELEASE_STAGES.indexOf(parts.stage)

  return (
    first.major - second.major ||
    first.minor - second.minor ||
    first.patch - second.patch ||
    stageRank(first) - stageRank(second) ||
    (first.build ?? 0) - (second.build ?? 0)
  )
}

/**
 * Version a deployment shows
 * @param {string} packageVersion - package.json version
 * @param {ReleaseStage} stage - Branch stage
 * @return {string} - Shown version
 */

export const displayVersion = (packageVersion: string, stage: ReleaseStage): string => {
  const parts = parseVersion(packageVersion)
  if (!parts || parts.stage === 'release') return packageVersion

  // Production only sees candidates
  const shown: ReleaseStage = stage === 'snapshot' ? 'snapshot' : 'candidate'

  return formatVersion({ ...parts, stage: shown })
}
