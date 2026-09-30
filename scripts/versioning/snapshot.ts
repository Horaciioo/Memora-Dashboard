import { formatVersion } from '../../src/utils/format/version.ts'
import type { VersionParts } from '../../src/utils/format/version.ts'
import {
  SETTINGS,
  assertCleanWorkBranch,
  commitSubjects,
  fail,
  flag,
  git,
  latestTag,
  openPullRequest,
  packageVersion,
  parseVersion,
  pullRequestChangelog,
  writePackageVersion,
  yarnRun,
} from './versions.ts'

/**
 * Next snapshot
 * @param {VersionParts} current - Package version
 * @return {VersionParts} - Next parts
 */

const nextSnapshot = (current: VersionParts): VersionParts => {
  if (current.stage === 'snapshot') return { ...current, build: (current.build ?? 0) + 1 }

  // First snapshot picks the digit
  if (flag('major')) {
    return { major: current.major + 1, minor: 0, patch: 0, stage: 'snapshot', build: 1 }
  }
  if (flag('patch')) return { ...current, patch: current.patch + 1, stage: 'snapshot', build: 1 }

  return { ...current, minor: current.minor + 1, patch: 0, stage: 'snapshot', build: 1 }
}

/**
 * Ship snapshot to testers
 * @return {void}
 */

const snapshot = (): void => {
  const title = flag('title')
  const isDryRun = Boolean(flag('dry-run'))

  if (typeof title !== 'string' && !isDryRun) {
    fail(
      'Usage : yarn snapshot --title "Added release notes" [--minor|--patch|--major] [--skip-build] [--dry-run]'
    )
  }

  assertCleanWorkBranch()

  const current = parseVersion(packageVersion())
  if (!current || current.stage === 'candidate') fail(`package.json porte ${packageVersion()}`)

  // Plan
  const next = formatVersion(nextSnapshot(current as VersionParts))
  const previous = latestTag()
  const subjects = commitSubjects(previous ? `${previous}..HEAD` : 'HEAD')
  if (subjects.length === 0) fail(`rien de neuf depuis ${previous}`)

  const changelog = pullRequestChangelog(subjects)
  const prTitle = `${changelog.emoji} v${next} : ${typeof title === 'string' ? title : '…'}`

  console.log(
    `Snapshot ${packageVersion()} → ${next} (${subjects.length} commits depuis ${previous ?? 'le début'})`
  )
  console.log(`\n${prTitle}\n\n${changelog.body}\n`)
  if (isDryRun) return

  // Numbered then checked
  writePackageVersion(next)
  try {
    yarnRun('type-check')
    yarnRun('lint')
    if (!flag('skip-build')) yarnRun('build')
  } catch {
    git('checkout', '--', 'package.json')
    fail(`les vérifications ont échoué, version remise à ${formatVersion(current as VersionParts)}`)
  }

  // Commit, tag, push
  git('add', 'package.json')
  git('commit', '-q', '-m', `🔖 Released snapshot ${next}`)
  git('tag', '-a', `v${next}`, '-m', `v${next}`)
  git('push', '-q', 'origin', 'HEAD')
  git('push', '-q', 'origin', `v${next}`)

  const url = openPullRequest({
    base: SETTINGS.snapshotBranch,
    head: SETTINGS.workBranch,
    title: prTitle,
    body: changelog.body,
  })

  console.log(`✔ v${next} poussée, PR : ${url}`)
}

snapshot()
