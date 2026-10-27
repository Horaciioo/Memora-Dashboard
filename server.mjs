import { createServer } from 'node:http'
import { parseArgs } from 'node:util'

import next from 'next'
import { WebSocketServer } from 'ws'

import realtime from './src/configurations/system/temps-reel.json' with { type: 'json' }

// Hub handed over by instrumentation, inside the Next bundle
const HUB_WAIT_MS = 5000
const HUB_POLL_MS = 50

const { values } = parseArgs({
  options: { port: { type: 'string', short: 'p' }, hostname: { type: 'string', short: 'H' } },
  strict: false,
})
const dev = process.env.NODE_ENV !== 'production'
const port = Number(values.port ?? process.env.PORT ?? 3000)
const hostname = values.hostname ?? process.env.HOSTNAME ?? (dev ? 'localhost' : '0.0.0.0')

const app = next({ dev, hostname, port })
await app.prepare()

const handle = app.getRequestHandler()
// Hot reload sockets of next dev
const upgradeNext = app.getUpgradeHandler()
const sockets = new WebSocketServer({
  noServer: true,
  // Small frames, compression costs more than it saves
  perMessageDeflate: false,
  maxPayload: realtime.maxPayloadKilobytes * 1024,
})

/**
 * Hub of the bundle, waited for on a cold dev start
 * @return {Promise<object | null>} - Hub
 */

const hubOf = async () => {
  for (let waited = 0; waited < HUB_WAIT_MS; waited += HUB_POLL_MS) {
    if (globalThis.memoraRealtime) return globalThis.memoraRealtime
    await new Promise((resolve) => setTimeout(resolve, HUB_POLL_MS))
  }

  return globalThis.memoraRealtime ?? null
}

const server = createServer((request, response) => handle(request, response))

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url ?? '/', 'http://memora')
  if (pathname !== realtime.path) return void upgradeNext(request, socket, head)

  socket.on('error', () => socket.destroy())
  void hubOf().then((hub) => {
    if (!hub) return void socket.destroy()
    sockets.handleUpgrade(request, socket, head, (live) => hub.accept(live, request))
  })
})

server.listen(port, hostname, () => {
  console.log(`> Memora on http://${hostname}:${port} (${dev ? 'dev' : 'production'})`)
})

// Docker stops with SIGTERM
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => {
    globalThis.memoraRealtime?.close()
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), HUB_WAIT_MS).unref()
  })
}
