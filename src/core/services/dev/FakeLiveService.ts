import 'server-only'

import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'

import { AppError, conflict, notFound } from '@/core/lib/errors'
import { FAKE_LIVE_SETTINGS } from '@/declarations/dev/fakeLive'
import { TWITCH_MOCK_ORIGIN } from '@/declarations/platforms/twitch'
import type { FakeLiveStatus } from '@/types/dev'

const run = promisify(execFile)

// Flags the fixtures loader needs, same as the yarn scripts
const NODE_ARGS = [
  '--disable-warning=ExperimentalWarning',
  '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
  '--import',
  './src/fixtures/loader.mjs',
  './src/scripts/fake-live/index.ts',
]

/**
 * Address of the fake Twitch, only on a dev database
 * @return {string} - Origin
 */

const originOrThrow = (): string => {
  if (!TWITCH_MOCK_ORIGIN) throw notFound()

  return TWITCH_MOCK_ORIGIN
}

/**
 * Call the control endpoint of the running fake live
 * @param {string} path - Control path
 * @param {'GET' | 'POST'} method - Verb
 * @return {Promise<Record<string, unknown> | null>} - Answer, null when nothing listens
 */

const control = async (
  path: string,
  method: 'GET' | 'POST'
): Promise<Record<string, unknown> | null> => {
  try {
    const response = await fetch(`${originOrThrow()}/control/${path}`, {
      method,
      signal: AbortSignal.timeout(FAKE_LIVE_SETTINGS.timeoutMs),
    })
    const body = (await response.json()) as Record<string, unknown>
    if (!response.ok) throw conflict()

    return body
  } catch (error) {
    if (error instanceof AppError) throw error

    return null
  }
}

/**
 * Whether a fake live runs and what it does
 * @return {Promise<FakeLiveStatus>} - Status
 */

export const fakeLiveStatus = async (): Promise<FakeLiveStatus> => {
  const answer = await control('status', 'GET')
  if (!answer) return { running: false, streaming: false, liveId: null, pace: null }

  return {
    running: true,
    streaming: answer.streaming === true,
    liveId: typeof answer.liveId === 'string' ? answer.liveId : null,
    pace: typeof answer.pace === 'string' ? answer.pace : null,
  }
}

/**
 * Start the fake live in the background, it outlives the request
 * @param {Object} input - Options
 * @param {string} input.pace - Chat pace
 * @param {string} input.discordId - Member who drives the test
 * @return {Promise<void>} - Started
 */

export const startFakeLive = async (input: { pace: string; discordId: string }): Promise<void> => {
  originOrThrow()
  if ((await fakeLiveStatus()).running) throw conflict()

  const child = spawn(
    process.execPath,
    [...NODE_ARGS, '--rythme', input.pace, '--compte', input.discordId],
    { cwd: process.cwd(), detached: true, stdio: 'ignore' }
  )
  child.unref()

  // Ready once the fake Twitch answers
  for (let attempt = 0; attempt < FAKE_LIVE_SETTINGS.startAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, FAKE_LIVE_SETTINGS.startPollMs))
    if ((await fakeLiveStatus()).running) return
  }

  throw conflict()
}

/**
 * Press a console key of the running fake live
 * @param {string} key - Key
 * @return {Promise<string>} - What happened
 */

export const pressFakeKey = async (key: string): Promise<string> => {
  const answer = await control(`key/${encodeURIComponent(key)}`, 'POST')
  if (!answer) throw conflict()

  return String(answer.done ?? '')
}

/**
 * Stop the running fake live
 * @return {Promise<void>} - Stopped
 */

export const stopFakeLive = async (): Promise<void> => {
  await control('quit', 'POST')
}

/**
 * Remove every fake live, channel link and alert it wrote
 * @return {Promise<void>} - Cleared
 */

export const clearFakeLives = async (): Promise<void> => {
  await run(process.execPath, [...NODE_ARGS, '--nettoyer'], { cwd: process.cwd() })
}
