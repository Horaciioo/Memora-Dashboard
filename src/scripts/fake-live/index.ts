import { parseArgs } from 'node:util'

import { CHAT_PACES, scheduleOnline, startChat } from './chat.ts'
import { CONSOLE_KEYS, listenKeys, runKey } from './console.ts'
import { killSockets, onSubscribed } from './eventsub.ts'
import { OPERATOR_IDENTITIES } from './identities.ts'
import {
  beatTeamPresence,
  clearFakeLives,
  closeDatabase,
  prepareFakeLive,
  readTwitchChannels,
} from './seed.ts'
import type { FakeLiveSetup } from './seed.ts'
import { startServer } from './server.ts'
import type { FakeControl } from './server.ts'
import { allViewers, channelOf, registerChannel, registerModerator } from './world.ts'

// Presence beat of the fake team
const BEAT_SECONDS = 15

// Longest wait before a forced exit
const QUIT_SECONDS = 2

const { values: options } = parseArgs({
  options: {
    createur: { type: 'string', default: 'Doigby' },
    compte: { type: 'string' },
    port: { type: 'string', default: '3399' },
    app: { type: 'string', default: 'http://localhost:3000' },
    rythme: { type: 'string', default: 'normal' },
    debut: { type: 'string', default: '20' },
    duree: { type: 'string', default: '240' },
    dans: { type: 'string', default: '1' },
    'sans-live': { type: 'boolean', default: false },
    nettoyer: { type: 'boolean', default: false },
  },
})

// Time stamped console line
const log = (line: string): void =>
  console.log(`${new Date().toLocaleTimeString('fr-FR')}  ${line}`)

/**
 * Refuse anything but the dev database
 * @return {void}
 */

const assertDev = (): void => {
  const environment = process.env.APP_ENV?.trim() || 'dev'
  if (environment !== 'dev')
    throw new Error(`Faux live refusé : APP_ENV vaut ${environment}, il faut dev.`)
}

/**
 * Teach the fake Twitch what Memora knows
 * @param {FakeLiveSetup | null} setup - Prepared live
 * @return {Promise<void>} - Known
 */

const learnChannels = async (setup: FakeLiveSetup | null): Promise<void> => {
  const channels = await readTwitchChannels()
  channels.forEach((channel) => registerChannel(channel.externalId, channel.login))
  setup?.team.forEach((seat) => registerModerator(seat.user))

  // Two viewers already banned
  if (!setup) return
  const channel = channelOf(setup.broadcasterId)
  allViewers()
    .slice(10, 12)
    .forEach((viewer) => channel.bans.set(viewer.id, null))
}

/**
 * Explain how to drive the test
 * @param {FakeLiveSetup | null} setup - Prepared live
 * @param {string} origin - Fake Twitch origin
 * @return {void}
 */

const printGuide = (setup: FakeLiveSetup | null, origin: string): void => {
  console.log(`\nFaux Twitch prêt sur ${origin}. Rien ne part chez Twitch.`)
  console.log(
    `Memora doit tourner avec TWITCH_MOCK_URL=${origin} dans .env (APP_ENV=dev), puis être relancé.`
  )
  if (setup) {
    console.log(
      `\nLive « ${setup.youtuberName} » créé (${setup.liveId}), annoncé par ${setup.operatorName}.`
    )
    console.log(`Chaîne simulée : ${setup.channelLogin} (${setup.broadcasterId}).`)
    console.log(
      `Équipe simulée : ${setup.team.map((seat) => seat.user.name).join(', ') || 'aucune'}.`
    )
  }
  console.log(
    `\nTon compte est déjà lié à « ${OPERATOR_IDENTITIES.moderator.name} », rien à faire dans les Paramètres.`
  )
  console.log(
    'Live en cours : le stream passe en direct tout seul peu après l’ouverture des abonnements. Les mêmes touches existent en boutons sur la page.'
  )
  console.log('\nTouches :')
  Object.entries(CONSOLE_KEYS).forEach(([key, label]) => console.log(`  ${key}  ${label}`))
  console.log('')
}

// Silence before warning about Memora
const SILENCE_SECONDS = 75

/**
 * Go live once Memora listens
 * @param {number} delaySeconds - Delay after the first subscription
 * @return {void}
 */

const autoGoLive = (delaySeconds: number): void => {
  const scheduled = new Set<string>()
  onSubscribed((subscription) => {
    const broadcasterId = subscription.condition.broadcaster_user_id ?? ''
    if (subscription.type !== 'stream.online' || scheduled.has(broadcasterId)) return
    scheduled.add(broadcasterId)
    log(`Memora écoute ${channelOf(broadcasterId).broadcaster.name}, direct dans ${delaySeconds} s`)
    scheduleOnline(channelOf(broadcasterId), delaySeconds, log)
  })

  // Memora may still talk to Twitch
  setTimeout(() => {
    if (scheduled.size > 0) return
    log('Memora n’a encore rien demandé : vérifie TWITCH_MOCK_URL dans .env et relance yarn dev.')
  }, SILENCE_SECONDS * 1000)
}

/**
 * Quit once, sockets or not
 * @param {Object} input - What runs
 * @param {() => void} input.stopChat - Chat stopper
 * @param {ReturnType<typeof setInterval>} input.beat - Presence beat
 * @param {Awaited<ReturnType<typeof startServer>>} input.server - Fake Twitch
 * @return {() => void} - Quit
 */

const quitter = (input: {
  stopChat: () => void
  beat: ReturnType<typeof setInterval>
  server: Awaited<ReturnType<typeof startServer>>
}): (() => void) => {
  let isQuitting = false

  return () => {
    if (isQuitting) return
    isQuitting = true
    input.stopChat()
    clearInterval(input.beat)
    if (process.stdin.isTTY) process.stdin.setRawMode(false)
    // Open sockets never hold the exit
    killSockets()
    input.server.closeAllConnections()
    input.server.close()
    setTimeout(() => process.exit(0), QUIT_SECONDS * 1000).unref()
    void closeDatabase()
      .catch(() => null)
      .finally(() => process.exit(0))
  }
}

/**
 * Run the fake live
 * @return {Promise<void>} - Running
 */

const main = async (): Promise<void> => {
  assertDev()

  // Clear and leave
  if (options.nettoyer) {
    const removed = await clearFakeLives()
    console.log(
      `Nettoyé : ${removed.lives} faux live(s), ${removed.links} liaison(s) Twitch factice(s).`
    )
    await closeDatabase()
    return
  }

  const pace = CHAT_PACES[options.rythme] ?? CHAT_PACES.normal
  const port = Number(options.port)
  const origin = `http://127.0.0.1:${port}`
  const setup = options['sans-live']
    ? null
    : await prepareFakeLive({
        creator: options.createur,
        discordId: options.compte ?? null,
        startInMinutes: Number(options.dans),
      })
  await learnChannels(setup)

  // The app drives the same keys through the fake server
  let quit: () => void = () => undefined
  const control: FakeControl = {
    status: () => ({
      running: true,
      liveId: setup?.liveId ?? null,
      streaming: Boolean(setup && channelOf(setup.broadcasterId).stream),
      pace: options.rythme,
    }),
    key: (key) =>
      runKey({
        key,
        broadcasterId: setup?.broadcasterId ?? '',
        origin: origin.replace(/^http/, 'ws'),
      }),
    quit: () => quit(),
  }
  const server = await startServer({ port, appOrigin: options.app, onLog: log, control })

  autoGoLive(Number(options.debut))

  const stopChat = startChat({ pace, durationMinutes: Number(options.duree), onLog: log })
  const beat = setInterval(() => {
    if (!setup || !channelOf(setup.broadcasterId).stream) return
    void beatTeamPresence(
      setup.liveId,
      setup.team.map((seat) => seat.accountId)
    ).catch(() => null)
  }, BEAT_SECONDS * 1000)

  quit = quitter({ stopChat, beat, server })
  process.once('SIGINT', quit)
  process.once('SIGTERM', quit)

  printGuide(setup, origin)
  listenKeys({
    broadcasterId: setup?.broadcasterId ?? '',
    origin: origin.replace(/^http/, 'ws'),
    onLog: log,
    onQuit: quit,
  })
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  await closeDatabase().catch(() => null)
  process.exitCode = 1
})
