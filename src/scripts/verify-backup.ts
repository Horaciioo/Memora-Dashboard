import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

// Tables skipped by counts
const IGNORED_TABLES = ['_prisma_migrations']

/**
 * Strips Prisma-only params
 * @param {string} url - Prisma database URL
 * @return {string} - libpq URL
 */

const toLibpqUrl = (url: string): string => {
  const parsed = new URL(url)
  parsed.searchParams.delete('schema')

  return parsed.toString()
}

/**
 * Swaps the database name
 * @param {string} url - libpq URL
 * @param {string} database - Target database
 * @return {string} - Rewritten URL
 */

const withDatabase = (url: string, database: string): string => {
  const parsed = new URL(url)
  parsed.pathname = `/${database}`

  return parsed.toString()
}

/**
 * Runs a Postgres binary
 * @param {string} command - Binary name
 * @param {string[]} args - Arguments
 * @return {string} - Standard output
 */

const run = (command: string, args: string[]): string => {
  const result = spawnSync(command, args, { encoding: 'utf8' })

  if (result.error) throw new Error(`${command} introuvable, installer les outils PostgreSQL`)
  if (result.status !== 0) throw new Error(`${command} a échoué : ${result.stderr.trim()}`)

  return result.stdout
}

/**
 * Row count per table
 * @param {string} url - libpq URL
 * @return {Map<string, number>} - Counts by table
 */

const countRows = (url: string): Map<string, number> => {
  // List public tables
  const tables = run('psql', [
    url,
    '-At',
    '-c',
    "select tablename from pg_tables where schemaname = 'public' order by tablename",
  ])
    .split('\n')
    .filter((name) => name && !IGNORED_TABLES.includes(name))

  // Count each table
  const counts = new Map<string, number>()
  for (const table of tables) {
    counts.set(table, Number(run('psql', [url, '-At', '-c', `select count(*) from "${table}"`])))
  }

  return counts
}

/**
 * Latest applied migration
 * @param {string} url - libpq URL
 * @return {string} - Migration name
 */

const latestMigration = (url: string): string =>
  run('psql', [
    url,
    '-At',
    '-c',
    'select migration_name from _prisma_migrations where finished_at is not null order by migration_name desc limit 1',
  ]).trim()

/**
 * Dump
 * @return {Promise<void>}
 */

const main = async (): Promise<void> => {
  const source = process.env.DATABASE_URL
  if (!source) throw new Error('DATABASE_URL manquant')

  // Given dump or fresh one
  const fileFlag = process.argv.indexOf('--file')
  const givenFile = fileFlag > -1 ? process.argv[fileFlag + 1] : undefined
  const sourceUrl = toLibpqUrl(source)
  const workDir = mkdtempSync(path.join(tmpdir(), 'backup-check-'))
  const dumpFile = givenFile ?? path.join(workDir, 'database.dump')

  if (!givenFile) {
    console.log('Sauvegarde de la base courante…')
    run('pg_dump', ['--format=custom', '--no-owner', '--no-privileges', '-f', dumpFile, sourceUrl])
  }

  // Throwaway restore target
  const scratch = `restore_check_${Date.now()}`
  const adminUrl = withDatabase(sourceUrl, 'postgres')
  const scratchUrl = withDatabase(sourceUrl, scratch)
  run('psql', [adminUrl, '-c', `create database "${scratch}"`])

  let failures = 0
  try {
    console.log(`Restauration dans ${scratch}…`)
    run('pg_restore', [
      '--no-owner',
      '--no-privileges',
      '--exit-on-error',
      '-d',
      scratchUrl,
      dumpFile,
    ])

    // Schema matches the repo
    const expected = readdirSync(path.join(process.cwd(), 'prisma', 'migrations'))
      .filter((entry) => /^\d/.test(entry))
      .sort()
      .at(-1)
    const restored = latestMigration(scratchUrl)
    const schemaOk = restored === expected
    if (!schemaOk) failures += 1
    console.log(`${schemaOk ? '✔' : '✘'} migration ${restored || 'aucune'} (dépôt : ${expected})`)

    // Row counts
    const after = countRows(scratchUrl)
    const before = givenFile ? null : countRows(sourceUrl)
    for (const [table, count] of after) {
      const reference = before?.get(table)
      const ok = reference === undefined || reference === count
      if (!ok) failures += 1
      console.log(
        `${ok ? '✔' : '✘'} ${table} : ${count}${reference === undefined ? '' : ` / ${reference}`}`
      )
    }
    if (after.size === 0) failures += 1
  } finally {
    // Always clean up
    run('psql', [adminUrl, '-c', `drop database if exists "${scratch}"`])
    rmSync(workDir, { recursive: true, force: true })
  }

  if (failures > 0) {
    console.error(`${failures} écart(s), la sauvegarde ne se restaure pas à l'identique`)
    process.exit(1)
  }

  console.log('Sauvegarde restaurable, base jetable supprimée')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
