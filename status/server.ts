import { createServer } from 'node:http'

import { COMPONENTS, SETTINGS } from './declarations.ts'
import { probe } from './probes.ts'
import { recordCheck } from './history.ts'
import { loadState, saveState } from './store.ts'

const state = loadState()

// One round of checks
const runRound = async (): Promise<void> => {
  const at = new Date()
  const outcomes = await Promise.all(COMPONENTS.map((item) => probe(item)))

  // Record in order
  COMPONENTS.forEach((item, index) =>
    recordCheck(state, item.id, outcomes[index].health, outcomes[index].ms, at)
  )
  state.checkedAt = at.toISOString()
  saveState(state)
}

// Routes
const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200).end('ok')
    return
  }

  if (request.url === '/api/status') {
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    response.end(
      JSON.stringify({
        ...state,
        meta: COMPONENTS.map(({ id, label, lead }) => ({ id, label, lead })),
      })
    )
    return
  }

  response.writeHead(404).end()
})

server.listen(SETTINGS.port)

// Never stops on a failed round
const tick = (): void => {
  runRound().catch((error) => console.error('round failed', error))
}

tick()
setInterval(tick, SETTINGS.intervalMs)
