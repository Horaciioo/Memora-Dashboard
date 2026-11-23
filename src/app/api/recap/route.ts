import { createProtectedRoute } from '@/core/lib/http/route'
import { readRecap, stampPresence } from '@/core/services/recap'

// Start of the window picked by hand, and the made-up recap of the dev build
const FROM_PARAM = 'depuis'
const DEMO_PARAM = 'demo'

// Date read from a query value, nothing for a value that is not one
const readFrom = (value: string | null): Date | null => {
  const date = value ? new Date(value) : null

  return date && !Number.isNaN(+date) ? date : null
}

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read what happened while I was away', tags: ['recap'] },
  handler: async ({ query, session, access }) =>
    readRecap({
      accountId: session.id,
      access,
      from: readFrom(query.get(FROM_PARAM)),
      demo: query.has(DEMO_PARAM),
    }),
})

export const POST = createProtectedRoute({
  descriptor: { summary: 'Say I am around, the next absence counts from here', tags: ['recap'] },
  handler: async ({ session }) => {
    await stampPresence(session.id)

    return { stamped: true }
  },
})
