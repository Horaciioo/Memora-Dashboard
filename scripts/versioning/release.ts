import {
  SETTINGS,
  assertCleanWorkBranch,
  closeUnreleased,
  commitSubjects,
  compareVersions,
  fail,
  flag,
  git,
  hasChangelog,
  latestTag,
  noteVersions,
  openPullRequest,
  packageVersion,
  parseVersion,
  pullRequestChangelog,
  writePackageVersion,
  yarnRun,
} from './versions.ts'

// Release commit files
const RELEASE_FILES = ['package.json', ...(SETTINGS.notesFile ? [SETTINGS.notesFile] : [])]

/**
 * Ship a release
 * @return {void}
 */

const release = (): void => {
  const version = process.argv[2] ?? ''
  const title = flag('title')
  const current = packageVersion()
  const parts = parseVersion(version)

  // Guards
  if (!parts || parts.stage !== 'release' || typeof title !== 'string') {
    fail('Usage : yarn release X.Y.Z --title "Added release notes" [--skip-build]')
  }
  if (compareVersions(version, current) <= 0) fail(`${version} doit dépasser ${current}`)
  if (SETTINGS.notesFile && noteVersions()[0] !== version) {
    fail(`écris d'abord la note ${version} en tête de CHANGELOG_RELEASES`)
  }

  assertCleanWorkBranch(RELEASE_FILES)

  const previous = latestTag()
  const changelog = pullRequestChangelog(commitSubjects(previous ? `${previous}..HEAD` : 'HEAD'))

  // Numbered then checked
  writePackageVersion(version)
  if (hasChangelog()) closeUnreleased(version, new Date().toISOString().slice(0, 10))
  try {
    yarnRun('type-check')
    yarnRun('lint')
    if (!flag('skip-build')) yarnRun('build')
  } catch {
    writePackageVersion(current)
    fail(`les vérifications ont échoué, package.json remis à ${current}`)
  }

  // Commit
  git('add', ...RELEASE_FILES)
  git('commit', '-q', '-m', `🔖 Released version ${version}`)
  git('tag', '-a', `v${version}`, '-m', `v${version}`)
  git('push', '-q', 'origin', 'HEAD')
  git('push', '-q', 'origin', `v${version}`)

  const url = openPullRequest({
    base: SETTINGS.snapshotBranch,
    head: SETTINGS.workBranch,
    title: `${changelog.emoji} v${version} : ${title as string}`,
    body: changelog.body || '## Changed\n\n- Released the version',
  })

  console.log(`✔ v${version} poussée, PR : ${url}`)
}

release()
