import { baseVersion } from '../../src/utils/format/version.ts'
import {
  changelogHasVersion,
  compareVersions,
  hasChangelog,
  noteVersions,
  packageVersion,
  parseVersion,
  SETTINGS,
} from './versions.ts'

/**
 * Refuse incoherent versions
 * @return {void}
 */

const check = (): void => {
  const version = packageVersion()
  const parts = parseVersion(version)
  const notes = noteVersions()
  const problems: string[] = []

  // Number against notes
  if (!parts || parts.stage === 'candidate') {
    problems.push(`package.json porte « ${version} », attendu X.Y.Z ou X.Y.Z-snapshot.N`)
  } else if (parts.stage === 'release') {
    if (SETTINGS.notesFile && notes[0] !== version) {
      problems.push(`la dernière note est ${notes[0] ?? 'absente'}, package.json dit ${version}`)
    }
    if (hasChangelog() && !changelogHasVersion(version)) {
      problems.push(`CHANGELOG.md n'a pas de section [${version}]`)
    }
  } else if (SETTINGS.notesFile && notes[0] !== baseVersion(parts)) {
    // A version above the last release never ships without its patchnote
    problems.push(
      `la snapshot ${version} n'a pas sa note : écris la note ${baseVersion(parts)} en tête de ${SETTINGS.notesFile}`
    )
  }

  // Newest first
  notes.forEach((note, index) => {
    const next = notes[index + 1]
    if (next && compareVersions(note, next) <= 0) {
      problems.push(
        `les notes ne sont pas rangées de la plus récente à la plus ancienne (${note} puis ${next})`
      )
    }
  })

  if (problems.length > 0) {
    console.error(`Version incohérente :\n- ${problems.join('\n- ')}`)
    process.exit(1)
  }

  console.log(`Version ${version} cohérente`)
}

check()
