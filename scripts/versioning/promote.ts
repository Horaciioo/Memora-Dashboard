import { displayVersion } from '../../src/utils/format/version.ts'
import {
  SETTINGS,
  commitSubjects,
  fail,
  flag,
  git,
  openPullRequest,
  parseVersion,
  pullRequestChangelog,
  stageOfBranch,
} from './versions.ts'

/**
 * Commits missing from a branch
 * @param {string} range - Promoted commits
 * @param {string} branch - Required branch
 * @return {string[]} - Missing subjects
 */

const skippedStep = (range: string, branch: string): string[] =>
  git('log', '--no-merges', '--format=%H %s', range)
    .split('\n')
    .filter(Boolean)
    .filter((line) => {
      const hash = line.split(' ')[0] ?? ''

      try {
        git('merge-base', '--is-ancestor', hash, `origin/${branch}`)
        return false
      } catch {
        return true
      }
    })
    .map((line) => line.slice(line.indexOf(' ') + 1))

/**
 * Promote previous branch
 * @return {void}
 */

const promote = (): void => {
  const { promotionFlow, snapshotBranch } = SETTINGS
  const target = process.argv[2] ?? ''
  const title = flag('title')
  const index = promotionFlow.indexOf(target)
  const finalBranch = promotionFlow[promotionFlow.length - 1]

  // Only past the snapshot branch
  if (index < 2 || typeof title !== 'string') {
    fail(
      `Usage : yarn promote ${promotionFlow.slice(2).join('|')} --title "Added release notes" [--confirm]`
    )
  }

  const source = promotionFlow[index - 1] ?? ''
  git('fetch', '--quiet', 'origin', source, target, snapshotBranch)

  const range = `origin/${target}..origin/${source}`
  const subjects = commitSubjects(range)
  if (subjects.length === 0) fail(`${target} a déjà tout ce que porte ${source}`)

  const packageVersion = (
    JSON.parse(git('show', `origin/${source}:package.json`)) as { version: string }
  ).version
  const shown = displayVersion(packageVersion, stageOfBranch(target))

  // Final branch gets releases only
  if (target === finalBranch) {
    if (parseVersion(packageVersion)?.stage !== 'release') {
      fail(
        `${source} porte ${packageVersion}, ${target} ne reçoit qu'une version publiée (yarn release X.Y.Z)`
      )
    }

    const skipped = skippedStep(range, snapshotBranch)
    console.log(`Vers ${target} : ${subjects.length} commits, v${shown}`)
    if (skipped.length > 0) fail(`passés à côté de ${snapshotBranch} : ${skipped.join(' ; ')}`)
    console.log(`Tous les commits sont passés par ${snapshotBranch} puis ${source}.`)
    if (!flag('confirm')) fail(`relance avec --confirm pour ouvrir la PR vers ${target}`)
  }

  const changelog = pullRequestChangelog(subjects)
  const url = openPullRequest({
    base: target,
    head: source,
    title: `${changelog.emoji} v${shown} : ${title as string}`,
    body: changelog.body || '## Changed\n\n- Promoted the tested version',
  })

  console.log(`✔ PR ${source} → ${target} (v${shown}) : ${url}`)
}

promote()
